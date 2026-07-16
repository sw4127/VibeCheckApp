import Link from "next/link";
import FluidField from "@/components/FluidField";

/**
 * Reading-room shell (2026-07-16 brief §3.C7 — serves C2/N1, voice per D5).
 * Server-rendered static prose: AI crawlers don't run JS, so every word here
 * lands in raw HTML (§3.C8). Same gold/dark system as the gym (design bar:
 * consistency).
 */

const GOLD = "hsl(42 80% 62%)";
const FLUID = ["hsl(42 55% 48%)", "hsl(28 50% 44%)", "hsl(52 45% 46%)", "hsl(20 40% 40%)"];

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col overflow-hidden px-6 py-12">
      <FluidField colors={FLUID} baseColor="#0B0A08" intensity={0.35} scrim={false} vignette />
      <div className="relative z-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-bold tracking-[0.4em]" style={{ color: GOLD }}>
            THE TASTE GYM
          </p>
          <Link
            href="/"
            className="text-xs text-muted underline underline-offset-4 transition hover:text-white"
          >
            ← the gym floor
          </Link>
        </div>
        {children}
        <p className="mt-14 text-[11px] text-muted/70">
          <Link href="/learn" className="underline">
            Reading room
          </Link>{" "}
          ·{" "}
          <Link href="/bias" className="underline">
            Take the Prestige Test
          </Link>{" "}
          ·{" "}
          <Link href="/legal" className="underline">
            Terms · Privacy
          </Link>
        </p>
      </div>
    </main>
  );
}
