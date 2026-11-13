

class UnitNormalizer:
    """
    Standardizes combustion and physical parameters into standard reference units
    while preserving the original values and explicit unit declarations.
    """

    @staticmethod
    def normalize_pressure(value: float | None, unit: str | None) -> tuple[float | None, str]:
        """Normalize pressure into standard kilopascals (kPa)."""
        if value is None:
            return None, "kPa"
        if not unit:
            return value, "kPa"

        u = unit.strip().lower()
        if u in ["kpa", "kilopascal", "kilopascals"]:
            return round(value, 3), "kPa"
        elif u in ["pa", "pascal", "pascals"]:
            return round(value / 1000.0, 3), "kPa"
        elif u in ["psi", "psia", "lb/in2"]:
            return round(value * 6.89476, 3), "kPa"
        elif u in ["atm", "atmosphere", "atmospheres"]:
            return round(value * 101.325, 3), "kPa"
        elif u in ["bar"]:
            return round(value * 100.0, 3), "kPa"
        elif u in ["torr", "mmhg"]:
            return round(value * 0.133322, 3), "kPa"
        return value, unit

    @staticmethod
    def normalize_velocity(value: float | None, unit: str | None) -> tuple[float | None, str]:
        """Normalize airflow velocity into standard centimeters per second (cm/s)."""
        if value is None:
            return None, "cm/s"
        if not unit:
            return value, "cm/s"

        u = unit.strip().lower()
        if u in ["cm/s", "cm/sec", "centimeters/second"]:
            return round(value, 3), "cm/s"
        elif u in ["m/s", "m/sec", "meters/second"]:
            return round(value * 100.0, 3), "cm/s"
        elif u in ["mm/s", "mm/sec"]:
            return round(value / 10.0, 3), "cm/s"
        elif u in ["ft/s", "fps"]:
            return round(value * 30.48, 3), "cm/s"
        return value, unit

    @staticmethod
    def normalize_oxygen(value: float | None) -> float | None:
        """Ensure oxygen concentration is recorded as percentage between 0 and 100."""
        if value is None:
            return None
        # If passed as a fraction (e.g. 0.21), convert to 21.0
        if 0.0 <= value <= 1.0:
            return round(value * 100.0, 2)
        if 0.0 <= value <= 100.0:
            return round(value, 2)
        return None
