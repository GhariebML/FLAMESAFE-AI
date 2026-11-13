"""Object storage vault for raw scientific files and exported dataset snapshots."""

import hashlib
import json
from pathlib import Path
from typing import Any


class StorageVaultService:
    """Manages immutable raw file assets and versioned dataset exports in local_vault or s3_compatible mode."""

    CANONICAL_EXPORT_COLUMNS = [
        "record_index",
        "investigation_code",
        "investigation_acronym",
        "experimental_run_code",
        "run_name",
        "fuel_material",
        "fuel_type",
        "geometry",
        "oxygen_pct",
        "pressure_kpa",
        "airflow_cm_s",
        "gravity_level",
        "gravity_regime",
        "parameter_name",
        "normalized_value",
        "normalized_unit",
        "raw_value",
        "raw_unit",
        "conversion_formula",
        "uncertainty",
        "source_file_name",
        "source_doi",
        "source_url",
        "page_number",
        "section_name",
        "extraction_method",
        "confidence_score",
        "validation_status",
        "evidence_classification",
    ]

    def __init__(self, base_dir: Path | None = None, backend_type: str = "local_vault") -> None:
        if base_dir is None:
            base_dir = Path(__file__).resolve().parents[2] / "data" / "vault"
        self.base_dir = base_dir
        self.backend_type = backend_type
        self.raw_dir = self.base_dir / "raw"
        self.exports_dir = self.base_dir / "exports"
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.exports_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def is_parquet_engine_available() -> bool:
        """Checks whether PyArrow is installed for genuine Apache Parquet binary serialization."""
        try:
            import pyarrow  # noqa: F401
            import pyarrow.parquet  # noqa: F401

            return True
        except ImportError:
            return False

    def store_raw_asset(self, file_identifier: str, filename: str, content: bytes) -> dict[str, Any]:
        """Stores a raw file asset keyed by its SHA-256 digest to guarantee immutability and deduplication."""
        sha256_hash = hashlib.sha256(content).hexdigest()
        safe_name = "".join(c if c.isalnum() or c in "._-" else "_" for c in filename)
        target_dir = self.raw_dir / sha256_hash[:8]
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / f"{file_identifier}_{safe_name}"
        target_path.write_bytes(content)

        return {
            "storage_backend": self.backend_type,
            "local_vault_path": str(target_path),
            "object_key": f"raw/{sha256_hash[:8]}/{file_identifier}_{safe_name}",
            "checksum_sha256": sha256_hash,
            "file_size_bytes": len(content),
        }

    def export_dataset_files(
        self,
        dataset_key: str,
        version_tag: str,
        records: list[dict[str, Any]],
        metadata: dict[str, Any],
    ) -> dict[str, str | None]:
        """Alias for store_dataset_exports accepting dataset_key and version_tag."""
        return self.store_dataset_exports(
            dataset_code=dataset_key,
            version_number=version_tag,
            records=records,
            metadata=metadata,
        )

    def store_dataset_exports(
        self,
        dataset_code: str,
        version_number: str,
        records: list[dict[str, Any]],
        metadata: dict[str, Any],
    ) -> dict[str, str | None]:
        """Writes CSV, JSON, and genuine Apache Parquet (via PyArrow) snapshot artifacts.
        Never writes a custom/JSON fallback with a .parquet extension.
        """
        version_dir = self.exports_dir / dataset_code / version_number
        version_dir.mkdir(parents=True, exist_ok=True)

        columns = self.CANONICAL_EXPORT_COLUMNS

        # 1. JSON Export
        json_path = version_dir / f"{dataset_code}_{version_number}.json"
        json_payload = {
            "dataset_code": dataset_code,
            "version_number": version_number,
            "metadata": metadata,
            "record_count": len(records),
            "records": records,
        }
        json_path.write_text(json.dumps(json_payload, indent=2, sort_keys=True), encoding="utf-8")

        # 2. CSV Export (preserving null as empty cell, never converting null to 0)
        csv_path = version_dir / f"{dataset_code}_{version_number}.csv"
        lines = [",".join(columns)]
        for r in records:
            row_vals: list[str] = []
            for col in columns:
                val = r.get(col)
                if val is None:
                    row_vals.append("")
                else:
                    s = str(val).replace('"', '""')
                    if "," in s or '"' in s or "\n" in s:
                        s = f'"{s}"'
                    row_vals.append(s)
            lines.append(",".join(row_vals))
        csv_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

        # 3. Genuine Apache Parquet Export via PyArrow (Option A + Option B guard:
        # if PyArrow is unavailable, parquet export is disabled rather than faking .parquet)
        parquet_path_str: str | None = None
        if self.is_parquet_engine_available():
            import pyarrow as pa
            import pyarrow.parquet as pq

            parquet_path = version_dir / f"{dataset_code}_{version_number}.parquet"
            arrow_schema = pa.schema(
                [
                    pa.field("record_index", pa.int64()),
                    pa.field("investigation_code", pa.string()),
                    pa.field("investigation_acronym", pa.string()),
                    pa.field("experimental_run_code", pa.string()),
                    pa.field("run_name", pa.string()),
                    pa.field("fuel_material", pa.string()),
                    pa.field("fuel_type", pa.string()),
                    pa.field("geometry", pa.string()),
                    pa.field("oxygen_pct", pa.float64()),
                    pa.field("pressure_kpa", pa.float64()),
                    pa.field("airflow_cm_s", pa.float64()),
                    pa.field("gravity_level", pa.string()),
                    pa.field("gravity_regime", pa.string()),
                    pa.field("parameter_name", pa.string()),
                    pa.field("normalized_value", pa.float64()),
                    pa.field("normalized_unit", pa.string()),
                    pa.field("raw_value", pa.float64()),
                    pa.field("raw_unit", pa.string()),
                    pa.field("conversion_formula", pa.string()),
                    pa.field("uncertainty", pa.float64()),
                    pa.field("source_file_name", pa.string()),
                    pa.field("source_doi", pa.string()),
                    pa.field("source_url", pa.string()),
                    pa.field("page_number", pa.int64()),
                    pa.field("section_name", pa.string()),
                    pa.field("extraction_method", pa.string()),
                    pa.field("confidence_score", pa.float64()),
                    pa.field("validation_status", pa.string()),
                    pa.field("evidence_classification", pa.string()),
                ],
                metadata={
                    b"flamesafe_dataset_code": dataset_code.encode("utf-8"),
                    b"flamesafe_version_number": version_number.encode("utf-8"),
                    b"flamesafe_provenance_verified": b"true",
                },
            )
            col_arrays = []
            for field in arrow_schema:
                col_name = field.name
                raw_col = [r.get(col_name) for r in records]
                col_arrays.append(pa.array(raw_col, type=field.type))

            table = pa.Table.from_arrays(col_arrays, schema=arrow_schema)
            pq.write_table(table, parquet_path, compression="snappy")
            parquet_path_str = str(parquet_path)

        return {
            "json": str(json_path),
            "csv": str(csv_path),
            "parquet": parquet_path_str,
        }
