import re
from typing import Dict, List, Any, Optional


class ScientificValidator:
    """
    Validates ingested and synthesized scientific records for consistency,
    absence of fabricated fields, and compliance with physical constraints.
    """

    DOI_PATTERN = re.compile(r"^10\.\d{4,9}/[-._;()/:A-Za-z0-9]+$")

    @classmethod
    def validate_doi(cls, doi: Optional[str]) -> bool:
        if not doi:
            return True  # Optional field
        return bool(cls.DOI_PATTERN.match(doi.strip()))

    @classmethod
    def validate_run_record(cls, run_dict: Dict[str, Any]) -> List[str]:
        warnings = []

        oxygen = run_dict.get("oxygen_concentration")
        if oxygen is not None:
            if oxygen < 0.0 or oxygen > 100.0:
                warnings.append(f"Oxygen concentration out of physical bounds: {oxygen}%")

        pressure = run_dict.get("pressure_value")
        if pressure is not None and pressure < 0.0:
            warnings.append(f"Atmospheric pressure cannot be negative: {pressure}")

        velocity = run_dict.get("airflow_velocity")
        if velocity is not None and velocity < 0.0:
            warnings.append(f"Airflow velocity cannot be negative: {velocity}")

        if not run_dict.get("gravity_regime"):
            warnings.append("Gravity regime missing from experimental run record.")

        return warnings
