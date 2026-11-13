export interface SpaceEnvironment {
  id: string;
  name: string;
  gravityLabel: string;
  nominalPressureKPa: number;
  nominalO2Percent: number;
  description: string;
}

export const SPACE_ENVIRONMENTS: SpaceEnvironment[] = [
  {
    id: "spacecraft",
    name: "Spacecraft",
    gravityLabel: "Microgravity (~10^-6 g)",
    nominalPressureKPa: 101.3,
    nominalO2Percent: 21.0,
    description: "Orbital exploration vehicle (e.g. Orion, Cygnus, Dragon) during transit phase.",
  },
  {
    id: "space_station",
    name: "Space Station",
    gravityLabel: "Microgravity (~10^-6 g)",
    nominalPressureKPa: 101.3,
    nominalO2Percent: 21.0,
    description: "Long-duration low Earth orbit habitable laboratory (e.g. ISS, Gateway).",
  },
  {
    id: "lunar_habitat",
    name: "Lunar Habitat",
    gravityLabel: "Lunar Gravity (0.166 g)",
    nominalPressureKPa: 56.5,
    nominalO2Percent: 28.0,
    description: "Pressurized lunar surface exploration base with exploration atmosphere.",
  },
  {
    id: "lunar_rover",
    name: "Lunar Rover",
    gravityLabel: "Lunar Gravity (0.166 g)",
    nominalPressureKPa: 56.5,
    nominalO2Percent: 32.0,
    description: "Mobile pressurized lunar surface rover cabin.",
  },
  {
    id: "mars_habitat",
    name: "Mars Habitat",
    gravityLabel: "Martian Gravity (0.38 g)",
    nominalPressureKPa: 56.5,
    nominalO2Percent: 28.0,
    description: "Martian surface base with partial gravity and external CO2 atmosphere.",
  },
  {
    id: "mars_rover",
    name: "Mars Rover",
    gravityLabel: "Martian Gravity (0.38 g)",
    nominalPressureKPa: 56.5,
    nominalO2Percent: 30.0,
    description: "Long-range pressurized Martian terrain exploration vehicle.",
  },
];
