export function formatPressure(val: number | null | undefined, unit = "kPa"): string {
  if (val === null || val === undefined) return "Not recorded";
  return `${val} ${unit}`;
}

export function formatVelocity(val: number | null | undefined, unit = "cm/s"): string {
  if (val === null || val === undefined) return "Not recorded";
  return `${val} ${unit}`;
}

export function formatOxygen(val: number | null | undefined): string {
  if (val === null || val === undefined) return "Not recorded";
  return `${val}% O₂`;
}
