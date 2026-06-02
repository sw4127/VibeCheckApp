import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="max-w-xl">
        <p className="text-sm font-bold tracking-[0.3em] text-indigo-300">
          VIBE CHECK
        </p>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
          Which World Cup player matches your vibe?
        </h1>
        <p className="mt-5 text-lg text-slate-300">
          Seven taps. No football knowledge needed. We read how you move through
          life and match you to a player&apos;s style — then hand you a card
          built to share.
        </p>
        <Link
          href="/quiz"
          className="mt-10 inline-block rounded-full bg-indigo-500 px-10 py-4 text-lg font-bold text-white transition hover:bg-indigo-400"
        >
          Start the quiz
        </Link>
        <p className="mt-6 text-xs text-slate-500">
          Free · takes ~30 seconds · no sign-up
        </p>
      </div>
    </main>
  );
}
