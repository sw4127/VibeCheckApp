/**
 * §29/Part-3 perceived performance: the result is a server component that can
 * await a narration call on cache miss (1–3s). This streams INSTANTLY on
 * navigation, so the post-crystallizer moment reads as "being read", never a
 * white gap. Copy mirrors the crystallizer's promise.
 */
export default function Loading() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-8 text-center">
      <p className="text-xs font-bold tracking-[0.4em] text-accent">VIBE CHECK</p>
      <div className="mt-10 flex flex-col items-center gap-6">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-accent" aria-hidden />
        <p className="animate-pulse text-sm tracking-[0.3em] text-muted">READING YOU NOW…</p>
      </div>
    </main>
  );
}
