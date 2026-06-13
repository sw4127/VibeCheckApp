import { appIcon } from "@/lib/icon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon (§23.F). */
export default function Icon() {
  return appIcon(64);
}
