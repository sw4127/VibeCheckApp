/**
 * THE 7-DAY RECALIBRATION (§20.B4) — the Hume layer productized: defects are
 * removable, a cultivated ear perceives truer. Engine-chosen, deterministic,
 * pure content (no DB, no LLM): the track targets the most extreme STATE axis
 * (priority order on ties), per §17.B the state lane drives "lately" work.
 * Coach register (§21.B): imperative, kind, concrete; lines ≤14 words.
 */
import type { PremiumProfile, StateLevels } from "@/content/sample-profile";

type Direction = "High" | "Low";

const TRACKS: Record<keyof StateLevels, Record<Direction, { name: string; days: string[] }>> = {
  rumination: {
    High: {
      name: "De-marination",
      days: [
        "One sad song max today. Pick it deliberately. Play it once.",
        "After the sad one: two songs that move. No skipping the second.",
        "Build a 5-song exit ramp — sad to neutral to bright. Use it once.",
        "Catch one replay urge. Name what it's for. Choose, don't drift.",
        "Lyrics-free day. Let your chest rest. Texture only.",
        "Revisit Day 1's song. Notice it lost a little weight.",
        "Retire one song you use to bleed. Archive, not delete.",
      ],
    },
    Low: {
      name: "Sit-with-it",
      days: [
        "Play one sad song to the end. Door closed. No multitasking.",
        "Same song, once more. Notice where you reach for the skip.",
        "Find the lyric that lands closest. Say it out loud once.",
        "Let an album run, no skips. Discomfort is information.",
        "Ask one friend their crying song. Play it. Just once.",
        "Write one line about what Day 1's song touched. One line.",
        "Keep one sad song in rotation. Permanent. That's the rep.",
      ],
    },
  },
  regulation: {
    High: {
      name: "Unclench",
      days: [
        "One listen with no job today. Not focus, not fix. Just play.",
        "Match your mood once instead of correcting it. Observe.",
        "Shuffle a playlist you didn't make. Surrender the wheel briefly.",
        "Notice the urge to fix a feeling. Wait one song first.",
        "Silence for one commute. The mood survives. So do you.",
        "Play something 'wrong' for the moment. See what it does anyway.",
        "One unplanned hour. Music allowed, prescriptions not.",
      ],
    },
    Low: {
      name: "Take the wheel",
      days: [
        "Pick tomorrow's first song tonight. On purpose. Play it on waking.",
        "Build a 3-song ignition for one task you've been dodging.",
        "Use one song as a door: play it, then start. No negotiating.",
        "Notice one mood you'd usually ride. Steer it one notch instead.",
        "Make a reset track. Use it once when the day tilts.",
        "Repeat Day 3. Doors work better the second time.",
        "Keep the ignition playlist. You drive now, sometimes.",
      ],
    },
  },
  energy: {
    High: {
      name: "Bring the floor down",
      days: [
        "First song of the day: something under 100 BPM. Yes, really.",
        "One full quiet album while doing nothing else impressive.",
        "Volume two notches lower all day. Lean in, not back.",
        "Find one slow song you'd defend. Add it somewhere visible.",
        "No music for one walk. The world has a mix too.",
        "End the night on the quiet album. Let it close the tab.",
        "Keep one quiet slot daily. The loud means more after.",
      ],
    },
    Low: {
      name: "Raise the pulse",
      days: [
        "One song that moves you — physically. Play it standing.",
        "Add two bright tracks to the morning. No irony allowed.",
        "One chorus, out loud. Witness optional, volume mandatory.",
        "Take the loud song outside. Walk faster than usual.",
        "Find one new release that isn't calm. Audition it twice.",
        "Soundtrack one chore at full volume. Watch the chore shrink.",
        "Keep one loud slot daily. Quiet's better as a choice.",
      ],
    },
  },
};

const MAINTENANCE = {
  name: "The tune-up",
  days: [
    "Play your oldest favorite. Notice what still works.",
    "One brand-new artist, two songs deep. Verdict optional.",
    "One sad song, fully. One bright song, fully. Compare.",
    "Make a 5-song self-portrait. No skips allowed in it.",
    "Silence for one stretch. Notice what you reach for after.",
    "Replay Day 4's portrait. Edit one track. Just one.",
    "Keep the portrait. Retake the read in a month.",
  ],
};

const PRIORITY: (keyof StateLevels)[] = ["rumination", "regulation", "energy"];

/** The most extreme state axis, priority order on ties (§20.B4). */
export function pickProtocolAxis(s: StateLevels | undefined): keyof StateLevels | null {
  if (!s) return null;
  for (const axis of PRIORITY) if (s[axis] !== "Medium") return axis;
  return null;
}

/** Deterministic protocol for a profile — always returns a full 7-day track. */
export function buildProtocol(p: PremiumProfile): { title: string; days: string[] } {
  const axis = pickProtocolAxis(p.stateLevels);
  const track =
    axis && p.stateLevels
      ? TRACKS[axis][p.stateLevels[axis] as Direction]
      : MAINTENANCE;
  return { title: `The 7-Day Recalibration: ${track.name}`, days: track.days };
}
