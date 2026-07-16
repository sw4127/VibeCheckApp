"use client";

import { useEffect } from "react";

/**
 * Kill the silent-no-op class (2026-07-16 brief §3.A2 — serves D6/N1, N3):
 * when analytics env is absent the pipe is DARK and every downstream KPI is
 * vapor, so the failure must be impossible to miss.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so this check reflects the
 * bundle that's actually running. Dev gets a fixed on-screen banner; every
 * env (dev + prod) gets a loud console warning. /api/health reports the
 * server-side view of the same facts.
 */
const MISSING = [
  !process.env.NEXT_PUBLIC_POSTHOG_KEY && "NEXT_PUBLIC_POSTHOG_KEY",
  !process.env.NEXT_PUBLIC_BASE_URL && "NEXT_PUBLIC_BASE_URL",
].filter(Boolean) as string[];

export default function EnvBanner() {
  useEffect(() => {
    if (MISSING.length === 0) return;
    console.warn(
      `⚠️ ANALYTICS DARK — missing ${MISSING.join(", ")}. ` +
        "Events are NOT being recorded; the D6 dataset accumulates nothing. " +
        "Setup: docs/OPERATIONS.md · self-check: /api/health",
    );
  }, []);

  if (MISSING.length === 0 || process.env.NODE_ENV === "production") return null;
  return (
    <div
      role="alert"
      className="fixed inset-x-0 bottom-0 z-50 bg-red-900/95 px-4 py-2 text-center text-xs font-semibold text-red-100"
    >
      ⚠️ ANALYTICS DARK — missing {MISSING.join(", ")} · events are not recorded (docs/OPERATIONS.md ·{" "}
      <a href="/api/health" className="underline">
        /api/health
      </a>
      )
    </div>
  );
}
