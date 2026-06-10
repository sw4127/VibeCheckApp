/** Bucket a [0,1] percentile into the enum-locked levels (spec §6). Pure, client-safe. */
export type LevelBucket = "High" | "Medium" | "Low";

export function levelOf(value: number): LevelBucket {
  if (value >= 0.66) return "High";
  if (value >= 0.34) return "Medium";
  return "Low";
}
