# Scientific Data Dictionary — FlameSafe AI

## 1. Principles of Scientific Data Representation
To maintain scientific integrity across combustion research:
1. **Explicit Units**: Every measurement must declare an explicit unit. No dimensionless physical quantities are assumed without documentation.
2. **Missing Values**: Unrecorded, non-measured, or missing parameters must be preserved as `null`. They must **NEVER** be coerced to zero, as zero has distinct physical meaning (e.g. 0.0 cm/s airflow implies purely diffusive quiescent conditions, whereas `null` airflow indicates an uninstrumented flow field).
3. **Unit Normalization with Provenance**: All parameters are converted to SI reference units for standardized comparison while preserving the raw recorded value and unit.

---

## 2. Core Scientific Parameters

### Atmospheric & Environmental Parameters

| Field Name | Type | Standard Unit | Valid Range | Physical Definition & Conversion |
| :--- | :--- | :--- | :--- | :--- |
| `oxygen_concentration` | Float | `% O2` | $0.0 - 100.0$ | Volume fraction of ambient oxygen. If recorded as mole fraction ($0.21$), converted via $X \times 100$. |
| `pressure_value` | Float | `kPa` | $0.0 - 500.0$ | Ambient atmospheric pressure in combustion chamber. Standard conversions: $1\text{ atm} = 101.325\text{ kPa}$, $1\text{ psi} = 6.89476\text{ kPa}$, $1\text{ bar} = 100.0\text{ kPa}$. |
| `airflow_velocity` | Float | `cm/s` | $0.0 - 200.0$ | Forced convective ventilation speed across fuel sample. Standard conversions: $1\text{ m/s} = 100\text{ cm/s}$, $1\text{ mm/s} = 0.1\text{ cm/s}$. |
| `gravity_regime` | String | Categorical | Enumerated | Categorical tags: `Microgravity (~10^-6 g)`, `Lunar Gravity (0.166 g)`, `Martian Gravity (0.38 g)`, `Terrestrial 1g`. |

---

### Fuel & Material Properties

| Field Name | Type | Allowed Values / Examples | Physical Definition |
| :--- | :--- | :--- | :--- |
| `fuel_type` | String | `Solid Polymer`, `Solid Fabric Blend`, `Liquid Hydrocarbon`, `Gaseous Hydrocarbon`, `Wire Insulation Polymer` | General physical classification of the combustible material. |
| `fuel_name` | String | `Polymethyl Methacrylate (PMMA)`, `Cotton-Fiberglass Fabric`, `n-Heptane Droplet`, `Kapton Polyimide` | Specific scientific, commercial, or IUPAC chemical designation. |
| `fuel_geometry` | String | `Flat slab (10x20x1.5 mm)`, `Spherical droplet (d=2.8 mm)`, `Coflow nozzle (d=4 mm)` | Dimensional configuration, thickness, and aspect ratio of fuel. |
| `suppressant` | String | `None (Air Flow)`, `Nitrogen Dilution`, `CO2 Scavenging`, `Radiative Quenching` | Active suppression agent or passive thermal extinction mechanism. |

---

### Quantitative Experimental Metrics

| Metric Name | Canonical Unit | Typical NASA Ranges | Experimental Description |
| :--- | :--- | :--- | :--- |
| `Flame Spread Rate` | `cm/s` | $0.01 - 0.50$ | Linear propagation velocity of the visible pyrolysis front along a solid fuel sample. |
| `Flame Length` | `mm` | $5.0 - 50.0$ | Measured axial distance from sample leading edge to visible luminous flame tip. |
| `Quench Airflow Velocity` | `cm/s` | $0.5 - 2.5$ | Low-speed ventilation threshold below which flame extinguishes due to radiative heat loss exceeding chemical heat release. |
| `Extinction Oxygen Limit (LOC)` | `% O2` | $14.0 - 20.0$ | Limiting oxygen concentration below which sustained flame propagation cannot continue. |
| `Burning Rate Constant (K)` | `mm2/s` | $0.30 - 0.70$ | Droplet regression rate constant in the classical $d^2$-law ($d^2 = d_0^2 - K t$). |
| `Mean Particle Diameter` | `microns` | $0.20 - 0.60$ | Mean aerodynamic or optical diameter of smoke particulate agglomerates. |
| `Peak Radiative Heat Flux` | `kW/m2` | $1.0 - 15.0$ | Maximum thermal radiation emitted by flame envelope to surrounding enclosure. |
