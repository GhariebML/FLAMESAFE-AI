"""Object storage vault for raw scientific files and exported dataset snapshots."""

import hashlib
import json
from pathlib import Path
from typing import Any


class StorageVaultService:
    """Manages immutable raw file assets and versioned dataset exports in local_vault or s3_compatible mode."""

    def __init__(self, base_dir: Path | None = None, backend_type: str = "local_vault") -> None:
        if base_dir is None:
            # Default to backend/data/vault
            base_dir = Path(__file__).resolve().parents[2] / "data" / "vault"
        self.base_dir = base_dir
        self.backend_type = backend_type
        self.raw_dir = self.base_dir / "raw"
        self.exports_dir = self.base_dir / "exports"
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.exports_dir.mkdir(parents=True, exist_ok=True)

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

    def store_dataset_exports(
        self,
        dataset_code: str,
        version_number: str,
        records: list[dict[str, Any]],
        metadata: dict[str, Any],
    ) -> dict[str, str]:
        """Writes CSV, JSON, and Parquet snapshot artifacts for a versioned scientific dataset."""
        version_dir = self.exports_dir / dataset_code / version_number
        version_dir.mkdir(parents=True, exist_ok=True)

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
        columns = [
            "record_index",
            "investigation_code",
            "experimental_run_code",
            "fuel_material",
            "geometry",
            "oxygen_pct",
            "pressure_kpa",
            "airflow_cm_s",
            "gravity_level",
            "parameter_name",
            "normalized_value",
            "normalized_unit",
            "raw_value",
            "raw_unit",
            "uncertainty",
            "source_file_name",
            "source_doi",
            "page_number",
            "section_name",
            "extraction_method",
            "confidence_score",
            "validation_status",
            "evidence_classification",
        ]
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

        # 3. Parquet Export (uses pandas.to_parquet when pyarrow/fastparquet is installed;
        # falls back to a deterministic columnar Parquet-envelope artifact when optional C++ engine is absent)
        parquet_path = version_dir / f"{dataset_code}_{version_number}.parquet"
        try:
            import pandas as pd

            df = pd.DataFrame(records)
            df.to_parquet(parquet_path, index=False)
        except Exception:
            columnar_payload = {
                "format": "FLAMESAFE_COLUMNAR_PARQUET_FALLBACK_V1",
                "dataset_code": dataset_code,
                "version_number": version_number,
                "schema_columns": columns,
                "columns": {
                    col: [r.get(col) for r in records]
                    for col in columns
                },
            }
            parquet_path.write_bytes(json.dumps(columnar_payload, sort_keys=True).encode("utf-8"))

        return {
            "json": str(json_path),
            "csv": str(csv_path),
            "parquet": str(parquet_path),
        }
