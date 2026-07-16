import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import { learnPage } from "@/content/learn";

const page = learnPage("prestige-bias-test")!;
export const metadata = explainerMetadata(page);

export default function Page() {
  return (
    <Explainer page={page} kicker="MACHINE 01 · THE FLAGSHIP">
      <p>
        The Prestige Test measures one thing: <strong>how far a famous name can move your
        ratings</strong>. Not whether you like the right music — whether the label in the room
        changes what your ears report.
      </p>
      <p>
        The design is a within-subject experiment, four minutes long. You hear eight short clips
        and rate each one <strong>blind</strong> — no artist, no context, just sound. Then you hear
        the same eight clips again with names and reputations attached, and rate them again. Your
        score is computed from the gap between the two passes: the share of your rating movement
        that flowed <em>toward</em> the labels.
      </p>
      <p>
        Here is the part that makes it an instrument instead of a party trick:{" "}
        <strong>three of the eight labels are deliberately false.</strong> A modest work arrives
        wearing borrowed acclaim; a distinguished one arrives dressed down. If your ratings follow
        the labels even when the labels lie, the movement can&apos;t be explained by the music —
        only by the prestige. You serve as your own control, which is why the test needs no
        external ground truth about which clip is &quot;objectively better.&quot;
      </p>
      <p>
        Every swap is confessed. The test ends with a <strong>mandatory debrief</strong> that names
        each false label, shows the true attribution, and shows exactly what your ratings did when
        the name was a lie. You cannot exit around it. An instrument built on deception owes you
        the disclosure — and the disclosure is where most people actually learn something.
      </p>
      <p>
        Your result is a measured number, not a diagnosis. And until enough real sessions exist to
        compute honest norms, it is labeled <strong>provisional</strong> — no invented percentiles,
        no &quot;better than 73% of listeners.&quot; The philosophy behind the design is Hume&apos;s
        criterion of{" "}
        <Link href="/learn/freedom-from-prejudice">freedom from prejudice</Link>; the measurement
        principles are laid out in the <Link href="/learn/methodology">methodology</Link>.
      </p>
    </Explainer>
  );
}
