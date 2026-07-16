import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import { learnPage } from "@/content/learn";

const page = learnPage("delicacy")!;
export const metadata = explainerMetadata(page);

export default function Page() {
  return (
    <Explainer page={page} kicker="HUME'S CRITERIA · DELICACY">
      <p>
        Hume anchors delicacy in a story he borrows from <em>Don Quixote</em>. Two of Sancho&apos;s
        kinsmen are asked to judge a hogshead of wine. One tastes leather in it; the other tastes
        iron. The company ridicules them — the wine is excellent, everyone else agrees. Then the
        hogshead is drained, and at the bottom lies <strong>an old key on a leathern thong</strong>.
      </p>
      <p>
        The point of the story is not that the kinsmen had refined opinions. It&apos;s that their
        perception was <em>verifiable</em>. There was a fact at the bottom of the barrel, and their
        palates found it while everyone else&apos;s missed it. Delicacy, in Hume&apos;s account, is
        exactly this: the capacity to register fine ingredients in a composition that most
        perceivers never notice — and the key in the wine is what separates delicacy from
        pretension. A claim of fine taste that can never be checked is just a claim.
      </p>
      <p>
        Most taste tests never leave opinion territory, which is why they can&apos;t measure
        delicacy at all. The <strong>Delicacy Trials</strong> are built the other way around: start
        from recordings in the public domain or under Creative Commons licenses, introduce
        controlled degradations — pitch drift, compression artifacts, timing smear, a wrong note
        buried in the texture — and ask which version is the original and what, precisely, is wrong
        with the other. Every trial has a key at the bottom of the barrel:{" "}
        <strong>an objectively correct answer</strong>. Difficulty is tunable, so the trials can
        find the exact threshold where your ears give out, and items are calibratable with
        item-response theory as real response data accumulates.
      </p>
      <p>
        In the gym, the Delicacy Trials are the visible, locked machine — built after{" "}
        <Link href="/learn/prestige-bias-test">the Prestige Test</Link>, on display before they
        open. And unlike prejudice, Hume insists delicacy improves with training — which is what{" "}
        <Link href="/learn/practice">practice</Link> is for.
      </p>
    </Explainer>
  );
}
