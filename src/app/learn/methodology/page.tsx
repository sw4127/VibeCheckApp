import Link from "next/link";
import Explainer, { explainerMetadata } from "../Explainer";
import { learnPage } from "@/content/learn";

const page = learnPage("methodology")!;
export const metadata = explainerMetadata(page);

export default function Page() {
  return (
    <Explainer page={page} kicker="THE HOUSE RULES · METHODOLOGY">
      <p>
        Hume closed his essay with a job description: strong sense, delicate sentiment, improved by
        practice, perfected by comparison, cleared of prejudice — <em>that</em> is a true judge.
        The Taste Gym&apos;s methodology is that sentence turned into engineering constraints. Four
        of them.
      </p>
      <p>
        <strong>1. Performance over self-report.</strong> Every instrument is a task where you can
        be wrong. Questionnaires measure your self-image; tasks measure you. The prestige gap is
        computed from what your ratings did under false labels; delicacy from whether you found the
        planted flaw; good sense from whether your confidence matched your accuracy. Nothing asks
        you to describe your taste, because that answer was never evidence.
      </p>
      <p>
        <strong>2. The user is their own control.</strong> Wherever possible the design is
        within-subject: your labeled ratings are compared to <em>your</em> blind ratings, your
        retest to your baseline. This removes the need for an external ground truth about which
        music is good — the instrument never has to take a side in that argument to measure your
        movement within it.
      </p>
      <p>
        <strong>3. Deterministic scoring, in code.</strong> Every number is computed by a scoring
        engine whose rules are fixed and inspectable — same responses, same score, every time. No
        language model classifies you, no black box guesses. Where an AI writes narrative around a
        result, it narrates a number that was already computed and cannot change it.
      </p>
      <p>
        <strong>4. No number the data can&apos;t back.</strong> Until a real calibration cohort
        exists, results carry a provisional label and no percentile appears anywhere in the
        product. As sessions accumulate, the psychometrics are standard and open about their
        assumptions: item-response theory for item difficulty and discrimination, signal-detection
        analysis for the trials, calibration curves and Brier scores for confidence, reliability
        checks before any norm is published — always with its N attached.
      </p>
      <p>
        The dataset behind this is self-generated and boring by design: anonymized response
        vectors — ratings, listen times, item-pool version, computed scores — under a random
        session id. No accounts, no names, no ad-tech. It exists so the instruments can be
        calibrated honestly, and that&apos;s the whole job. The criteria these rules serve are in
        the reading room — start with{" "}
        <Link href="/learn/freedom-from-prejudice">freedom from prejudice</Link> — or skip the
        theory and <Link href="/bias">take the Prestige Test</Link>.
      </p>
    </Explainer>
  );
}
