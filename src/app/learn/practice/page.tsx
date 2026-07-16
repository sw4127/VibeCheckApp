import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import { learnPage } from "@/content/learn";

const page = learnPage("practice")!;
export const metadata = explainerMetadata(page);

export default function Page() {
  return (
    <Explainer page={page} kicker="HUME'S CRITERIA · PRACTICE">
      <p>
        Practice is the criterion that makes this product a <strong>gym</strong> rather than a
        mirror. Hume is unambiguous: nothing improves the faculty of judging more than{" "}
        <em>practice in a particular art</em> — the repeated, attentive survey of works of one
        kind. Taste, in his account, is not an endowment you check once and frame. It&apos;s a
        capacity that sharpens with reps and dulls with neglect.
      </p>
      <p>
        He even describes the beginner&apos;s condition: confront a work for the first time and the
        sentiment it produces is <em>obscure and confused</em> — you can tell you feel something,
        but not which parts of the work are doing it, or how well. Only repeated encounters let a
        judge resolve that blur into discrimination: this voicing, that transition, this specific
        flaw. Anyone who has learned to hear the difference between a good and a great recording of
        the same piece has lived this.
      </p>
      <p>
        The gym takes the claim literally, with the same honesty rule as everything else: an
        improvement you can&apos;t measure is an improvement you can&apos;t claim. The training arc
        is practice made checkable — <strong>retests on the same instruments over time</strong>,
        progression charts, and calibration curves that move (or refuse to). If your prestige gap
        shrinks across sessions, that&apos;s practice working, in a number. If it doesn&apos;t,
        the chart says so, and the chart wins the argument.
      </p>
      <p>
        Practice alone isn&apos;t sufficient, though. Hume pairs it with breadth — you can rehearse
        one narrow corner of music forever and stay a provincial judge. That failure mode belongs
        to <Link href="/learn/comparison">comparison</Link>, and knowing whether to trust your own
        sharpening judgment belongs to <Link href="/learn/good-sense">good sense</Link>. The gym
        starts where prejudice is caught in the act:{" "}
        <Link href="/learn/prestige-bias-test">the Prestige Test</Link>.
      </p>
    </Explainer>
  );
}
