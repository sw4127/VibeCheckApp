import { sigilIcon } from "@/lib/icon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon — the sigil (§23.F). */
export default function Icon() {
  return sigilIcon(64);
}
