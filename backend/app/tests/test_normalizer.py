from app.ingestion.normalizers.unit_normalizer import UnitNormalizer


def test_pressure_normalization():
    # 1 atm = 101.325 kPa
    p, u = UnitNormalizer.normalize_pressure(1.0, "atm")
    assert u == "kPa"
    assert round(p, 1) == 101.3

    # 14.7 psi ~ 101.35 kPa
    p_psi, u_psi = UnitNormalizer.normalize_pressure(14.7, "psi")
    assert u_psi == "kPa"
    assert round(p_psi, 0) == 101.0

    # None handling
    p_none, u_none = UnitNormalizer.normalize_pressure(None, "kPa")
    assert p_none is None


def test_velocity_normalization():
    # 0.1 m/s = 10 cm/s
    v, u = UnitNormalizer.normalize_velocity(0.1, "m/s")
    assert u == "cm/s"
    assert v == 10.0


def test_oxygen_normalization():
    # 0.21 fraction -> 21.0 %
    assert UnitNormalizer.normalize_oxygen(0.21) == 21.0
    assert UnitNormalizer.normalize_oxygen(21.0) == 21.0
    assert UnitNormalizer.normalize_oxygen(None) is None
