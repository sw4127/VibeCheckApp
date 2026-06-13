"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * §23.A (G4) — route-level error boundary. The $0 interim monitoring: failures
 * surface as `client_error` analytics events (visible in the dashboard) instead
 * of dying invisibly. Sentry upgrade is a runbook item.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    track("client_error", {
      digest: error.digest ?? "",
      message: String(error.message ?? "").slice(0, 120),
      path: typeof window !== "undefined" ? window.location.pathname : "",
    });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-bold tracking-[0.4em] text-accent">VIBE CHECK</p>
      <h1 className="mt-6 font-display text-4xl font-black leading-tight">The needle skipped.</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Something broke on our side — your answers are safe in this page&apos;s link.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
      >
        Try again
      </button>
      <a href="/" className="mt-4 text-sm text-muted underline">
        Back to the start
      </a>
    </main>
  );
}
