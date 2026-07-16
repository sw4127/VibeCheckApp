import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import { learnPage } from "@/content/learn";

const page = learnPage("good-sense")!;
export const metadata = explainerMetadata(page);

export default function Page() {
  return (
    <Explainer page={page} kicker="HUME'S CRITERIA · GOOD SENSE">
      <p>
        Good sense is Hume&apos;s supervising faculty — reason, standing behind perception and
        checking its work. The other criteria can all misfire without it: delicate ears with no
        judgment about when to trust themselves, practice that rehearses a bias into a habit,
        breadth that collects exposure without weighing it. Good sense is the part of a judge that
        knows <strong>when their own verdict is reliable and when it isn&apos;t</strong>.
      </p>
      <p>
        That sounds unmeasurable — a faculty about faculties. It isn&apos;t. Decision science has a
        precise, boring name for it: <strong>calibration</strong>. A judge is well calibrated when
        their confidence matches their accuracy — when the answers they&apos;d stake 95% on are
        right about 95% of the time, and the coin-flip feelings are right about half the time.
        Overconfidence and underconfidence are both failures of exactly the thing Hume was pointing
        at: knowing the reliability of your own judgment.
      </p>
      <p>
        So the gym measures it. On performance items — trials with objectively right answers, like
        the <Link href="/learn/delicacy">Delicacy Trials</Link> — you attach a confidence level to
        each answer: <strong>95%, 70%, or 50%</strong>. Plot claimed confidence against actual
        accuracy and you get a calibration curve; a Brier score summarizes how far you sit from the
        diagonal where confidence and reality agree. The result is Hume&apos;s most abstract
        criterion operationalized as one of the most rigorous numbers in the building.
      </p>
      <p>
        One honesty note, because it&apos;s the house rule: confidence input never inflates or
        weights your scores — it&apos;s measured <em>against</em> your accuracy, never blended into
        it. A confident wrong answer costs you calibration; it cannot buy you points. The gym opens
        with <Link href="/learn/prestige-bias-test">the Prestige Test</Link>; the full measurement
        rules live in the <Link href="/learn/methodology">methodology</Link>.
      </p>
    </Explainer>
  );
}
