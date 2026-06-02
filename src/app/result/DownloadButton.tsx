"use client";

import { useState } from "react";

/**
 * Downloads the card PNG. In normal browsers this triggers a file save; in
 * IG/TikTok in-app webviews where programmatic download is blocked, users can
 * still long-press the visible card image to save it (that's why the card is a
 * real server-rendered image URL, not a client canvas).
 */
export default function DownloadButton({
  url,
  label,
  filename,
}: {
  url: string;
  label: string;
  filename: string;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    try {
      setBusy(true);
      const res = await fetch(url);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50"
    >
      {busy ? "Preparing…" : label}
    </button>
  );
}
