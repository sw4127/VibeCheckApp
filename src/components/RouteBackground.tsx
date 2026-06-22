"use client";

/**
 * Route transition shell (the anti-flash-bang system). Two universal layers, no
 * experimental APIs:
 *  1. Luminance floor — sets `--app-bg` on <html> for the route; the CSS
 *     transition on `body` (globals.css) EASES it on navigation, so dark↔bright
 *     never hard-cuts. (Pages must be transparent for it to show — the quizzes'
 *     FluidField is transparent-base; result/landing already are.)
 *  2. Content cross-fade — re-keying by pathname remounts the page and plays a
 *     short fade-in, so content arrives gracefully over the easing surface.
 *
 * (Native View Transitions were the first choice, but React 19.2 stable doesn't
 * ship <ViewTransition>; this universal approach works in every in-app browser.)
 */
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function bgFor(path: string): string {
  if (path === "/quiz") return "#E6E6DD"; // the bright tournament stage
  if (path.startsWith("/music")) return "#0A0A11"; // music's deep base
  return "#08090d"; // app dark (landing, result, vs, premium…)
}

export default function RouteBackground({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  useEffect(() => {
    document.documentElement.style.setProperty("--app-bg", bgFor(path));
  }, [path]);
  return (
    <div key={path} className="route-fade flex flex-1 flex-col">
      {children}
    </div>
  );
}
