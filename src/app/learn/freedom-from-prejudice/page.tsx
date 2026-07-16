import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import { learnPage } from "@/content/learn";

const page = learnPage("freedom-from-prejudice")!;
export const metadata = explainerMetadata(page);

export default function Page() {
  return (
    <Explainer page={page} kicker="HUME'S CRITERIA · FREEDOM FROM PREJUDICE">
      <p>
        Of Hume&apos;s five criteria, this is the one about contamination. A judge, he argued, must
        keep the mind <em>&quot;free from all prejudice&quot;</em> and let nothing into the verdict
        except the object itself — not the author&apos;s reputation, not the fashion of the moment,
        not loyalty, not rivalry. The judgment should belong to the work, and works don&apos;t have
        names until someone attaches one.
      </p>
      <p>
        Hume was blunt about how rarely anyone manages this. Reputation arrives before the art
        does; by the time you press play on an acclaimed record, the acclaim has already voted. The
        striking thing is that in 1757 he described what is now a replicated experimental finding:
        attach a prestigious label to a work and evaluations move, even when the label is false.
        Wine tastes better wearing an expensive price tag; the same manuscript reads worse under an
        unknown byline.
      </p>
      <p>
        Most people, asked whether they judge music by the name on it, say no. That answer is
        worthless — not because people lie, but because prejudice doesn&apos;t announce itself to
        the person having it. The only honest way to know is to be caught in the act.
      </p>
      <p>
        That is the entire design brief of{" "}
        <Link href="/learn/prestige-bias-test">the Prestige Test</Link>: same clips, rated blind
        and then labeled, with some labels deliberately swapped. When your rating follows a false
        name, prejudice is the only suspect left in the room. The gap between your two passes is
        Hume&apos;s criterion turned into a number — and because you are your own control, the
        number never depends on anyone&apos;s opinion of what the &quot;right&quot; rating was.
      </p>
      <p>
        Freedom from prejudice is the first criterion the gym measures, but it is one of five. The
        others — <Link href="/learn/delicacy">delicacy</Link>,{" "}
        <Link href="/learn/practice">practice</Link>,{" "}
        <Link href="/learn/comparison">comparison</Link>, and{" "}
        <Link href="/learn/good-sense">good sense</Link> — have their own machines, built or
        planned.
      </p>
    </Explainer>
  );
}
