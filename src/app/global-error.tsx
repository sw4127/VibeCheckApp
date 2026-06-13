"use client";

/**
 * §23.A (G4) — root-layout error boundary. Must render its own <html>/<body>
 * (it replaces the root layout), so styling is inline and dependency-free.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#08090d",
          color: "#f4f5f8",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <p style={{ fontSize: 12, letterSpacing: "0.4em", fontWeight: 700, color: "#7c6cff" }}>
          VIBE CHECK
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "16px 0 8px" }}>The needle skipped.</h1>
        <p style={{ fontSize: 14, color: "#8b91a3", maxWidth: 360 }}>
          Something broke on our side{error.digest ? ` (ref ${error.digest})` : ""}. Your answers
          are safe in this page&apos;s link.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 24,
            padding: "12px 28px",
            borderRadius: 999,
            border: "none",
            background: "#7c6cff",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <a href="/" style={{ marginTop: 14, fontSize: 13, color: "#8b91a3" }}>
          Back to the start
        </a>
      </body>
    </html>
  );
}
