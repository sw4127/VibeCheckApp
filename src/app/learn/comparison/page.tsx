import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import { learnPage } from "@/content/learn";

const page = learnPage("comparison")!;
export const metadata = explainerMetadata(page);

export default function Page() {
  return (
    <Explainer page={page} kicker="HUME'S CRITERIA · COMPARISON">
      <p>
        Hume&apos;s test case is a pairing nobody now remembers was ever a contest: John Ogilby, a
        workmanlike seventeenth-century versifier, against John Milton. His point was
        uncomfortable: a person acquainted with no better poetry might <em>genuinely</em> admire
        Ogilby — and the admiration would be sincere, felt, and wrong in a way the admirer has no
        way to detect. <strong>By comparison alone</strong>, Hume argued, do we learn to assign
        degrees of praise; whoever has seen only one kind of beauty cannot rank any.
      </p>
      <p>
        Comparison is therefore a criterion about <strong>exposure</strong> — the range of works a
        judge has actually weighed against each other. And that makes it structurally different
        from the other criteria: breadth isn&apos;t a skill to test, it&apos;s a fact about your
        listening history. You can&apos;t fake it on a task, and you can&apos;t self-report it
        accurately either — everyone believes their range is wider than it is, because nobody hears
        the music they&apos;ve never played.
      </p>
      <p>
        So the planned comparison instrument doesn&apos;t quiz you. It <strong>maps</strong> you:
        an optional import of your streaming history (data only — no audio, no playback) measures
        the breadth of what you&apos;ve actually compared: how many sound-worlds, how deep in
        each, how lopsided the distribution. The instrument reports exposure rather than scoring
        judgment, because that&apos;s what the criterion is — you can&apos;t be blamed for a narrow
        map, but you also can&apos;t rank what you&apos;ve never heard against anything.
      </p>
      <p>
        Breadth then feeds the criteria that do involve skill: a wide map gives{" "}
        <Link href="/learn/practice">practice</Link> its material, and it&apos;s the guardrail that
        keeps a sharpening judge from becoming a connoisseur of one street. The gym&apos;s open
        machine, <Link href="/learn/prestige-bias-test">the Prestige Test</Link>, is where to
        start; comparison arrives later on the roadmap, clearly marked as an exposure measure and
        nothing more.
      </p>
    </Explainer>
  );
}
