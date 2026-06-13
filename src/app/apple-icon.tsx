import { sigilIcon } from "@/lib/icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon (§23.F) — what "Add to Home Screen" uses. */
export default function AppleIcon() {
  return sigilIcon(180);
}
