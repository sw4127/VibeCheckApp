/**
 * Reading-room registry (2026-07-16 brief §3.C7 — serves C2/N1; voice per D5:
 * Hume narrates, depth is unlocked never buried).
 *
 * One entry per explainer page. The registry feeds the /learn index, the
 * sitemap, and each page's Article/BreadcrumbList/FAQPage JSON-LD, so a new
 * explainer is one entry + one page.tsx and every surface stays in sync.
 *
 * N3: nothing here states a number the data can't support. Methodology
 * numbers arrive when the cohort does.
 */

export interface LearnFaq {
  q: string;
  a: string;
}

export interface LearnPage {
  slug: string;
  /** Display title (H1). */
  title: string;
  /** <title> + meta description. */
  metaTitle: string;
  description: string;
  /** Index-card teaser line. */
  teaser: string;
  faq: LearnFaq[];
}

export const LEARN_PAGES: LearnPage[] = [
  {
    slug: "prestige-bias-test",
    title: "What is the Prestige Test?",
    metaTitle: "What is the Prestige Test? — The Taste Gym",
    description:
      "Ten clips, rated twice — once blind, once with names attached. Some names are deliberately false. The gap between your two ratings is your prestige-bias number.",
    teaser: "The flagship machine: how far can a famous name move your ratings?",
    faq: [
      {
        q: "How does the Prestige Test work?",
        a: "You rate ten short music clips blind, then rate the same ten clips again — eight with artist names and reputations attached, two deliberately left unlabeled as drift controls. Three of the eight labels are deliberately swapped. Your score is computed from how far your ratings moved toward the labels, corrected by your measured drift on the unlabeled controls — a measured gap, not a self-report.",
      },
      {
        q: "Why does the test lie about some labels?",
        a: "If every label were true, a rating shift toward acclaimed names could just mean the acclaimed clips were genuinely better. Swapped labels separate the name from the sound: when your rating follows a false name, only prestige can explain the move. Every swap is disclosed on a mandatory debrief screen before you leave — the deception is the instrument, and you always learn the truth.",
      },
      {
        q: "Is my result a percentile?",
        a: "Not yet. Results are labeled provisional until a calibration cohort exists — the product does not fabricate norms. You get your measured gap and what it means; percentiles arrive when there are enough real sessions to compute them honestly.",
      },
      {
        q: "Is the Prestige Test free?",
        a: "Yes. The assessment and your headline score are free. The paid tier is the training arc — retests, progression charts, and the delicacy battery — not the reading itself.",
      },
    ],
  },
  {
    slug: "freedom-from-prejudice",
    title: "Freedom from prejudice",
    metaTitle: "Freedom from Prejudice — Hume's Criterion, Measured",
    description:
      "Hume required a true judge to clear their mind of every consideration except the work itself. The Prestige Test measures how far you actually manage it.",
    teaser: "Hume's fourth criterion — the one the flagship machine measures.",
    faq: [
      {
        q: "What did Hume mean by freedom from prejudice?",
        a: "In 'Of the Standard of Taste' (1757), Hume argued a critic must set aside everything about the work except the work — reputation, fashion, friendship, rivalry — and judge only what is in front of them. A judgment moved by the author's name rather than the object is, in his account, corrupted.",
      },
      {
        q: "Can prestige bias be measured?",
        a: "Yes, with a within-subject design: the same person rates the same works with and without labels, and some labels are deliberately false. The rating shift attributable to the label is a measurable quantity. You serve as your own control, so no external ground truth about the music's quality is needed.",
      },
    ],
  },
  {
    slug: "delicacy",
    title: "Delicacy of taste",
    metaTitle: "Delicacy of Taste — The Key in the Wine",
    description:
      "Sancho's kinsmen tasted leather and iron in a hogshead of wine and were laughed at — until the key on a leathern thong was found at the bottom. Delicacy is verifiable perception.",
    teaser: "The locked machine: can your ears find the key in the wine?",
    faq: [
      {
        q: "What is the key-in-the-wine story?",
        a: "Hume retells it from Don Quixote: two of Sancho's kinsmen judged a wine good but for a faint taste of leather and iron. They were ridiculed — until the hogshead was emptied and an old key on a leathern thong was found at the bottom. Their perception was real and verifiable; that is delicacy.",
      },
      {
        q: "How will the Delicacy Trials work?",
        a: "Public-domain and Creative-Commons recordings are altered with controlled degradations — pitch drift, compression artifacts, timing smear, a buried wrong note — and you identify the original and name the flaw. Unlike a taste quiz, answers are objectively right or wrong, difficulty is tunable, and items can be calibrated with item-response theory.",
      },
      {
        q: "When do the Delicacy Trials open?",
        a: "The battery is built after the Prestige Test and is visible in the gym now as a locked tier. A gym has equipment you can see before you're ready for it.",
      },
    ],
  },
  {
    slug: "practice",
    title: "Practice",
    metaTitle: "Practice — Why Taste Is Trainable",
    description:
      "Hume held that no one is born a judge: facility in judging comes from repeated, attentive encounters with works. Practice is the criterion that makes a taste gym possible.",
    teaser: "The premise of the whole gym: judgment improves with reps.",
    faq: [
      {
        q: "Did Hume think taste could be trained?",
        a: "Yes — explicitly. He wrote that nothing improves the talent of judging more than practice in a particular art, and that a first attempt at judging is always 'obscure and confused.' Delicacy sharpens with use; that claim is why a gym for taste is coherent at all.",
      },
      {
        q: "How does the Taste Gym use practice?",
        a: "The paid training arc is practice made measurable: retests over time, progression charts, and calibration-improvement curves. The claim is never 'you feel more refined' — it is a before-and-after number on the same instruments.",
      },
    ],
  },
  {
    slug: "comparison",
    title: "Comparison",
    metaTitle: "Comparison — Ogilby, Milton, and Breadth",
    description:
      "Whoever has seen only one kind of beauty, Hume argued, cannot rank any. Comparison is breadth of exposure — and it can be mapped rather than claimed.",
    teaser: "You can't rank what you've never heard against anything.",
    faq: [
      {
        q: "Why did Hume compare Ogilby and Milton?",
        a: "Hume's point was that only someone who has weighed many works against each other can assign degrees of merit — a person acquainted with nothing else might genuinely prefer Ogilby, and only breadth of comparison exposes the mistake. The pairing stands for the criterion: ranking requires range.",
      },
      {
        q: "How would comparison be measured?",
        a: "As exposure, not judgment: a planned instrument maps the breadth of what you have actually listened to (via optional listening-history import — data only, no audio). Breadth is a fact about your history; the instrument reports it rather than scoring it.",
      },
    ],
  },
  {
    slug: "good-sense",
    title: "Good sense",
    metaTitle: "Good Sense — Calibration as a Number",
    description:
      "Hume's good sense checks the other faculties: knowing when your own judgment is trustworthy. Confidence-versus-accuracy calibration turns it into a computed curve.",
    teaser: "Do you know when you're right? That's measurable too.",
    faq: [
      {
        q: "What is good sense in Hume's essay?",
        a: "The supervising faculty: reason keeping the judge's other capacities honest — noticing purpose, consistency, and context, and guarding against one's own errors. A judge with delicate perception but no sense of when to trust it still judges badly.",
      },
      {
        q: "How does calibration measure good sense?",
        a: "On performance items you attach a confidence level (95%, 70%, or 50%) to each answer. Plotting confidence against actual accuracy yields a calibration curve, and Brier scores summarize it: well-calibrated judges are right about as often as they claim to be. Overconfidence and underconfidence both show up as measured distances from the diagonal.",
      },
    ],
  },
  {
    slug: "methodology",
    title: "Methodology",
    metaTitle: "Methodology — Quantifying Hume's Standard of Taste",
    description:
      "Performance tasks over self-report, the user as their own control, deterministic scoring in code, and a psychometrics pipeline: how the Taste Gym measures without fabricating.",
    teaser: "The measurement design, stated plainly — including what we refuse to claim.",
    faq: [
      {
        q: "Why performance tasks instead of a questionnaire?",
        a: "Self-report measures self-image. On a performance task you can be wrong, and being wrong is informative: the prestige gap, the detection rate, and the calibration curve are all computed from what you did, not what you said about yourself.",
      },
      {
        q: "Does an AI score my taste?",
        a: "No. Every score is computed by a deterministic engine in code — the same inputs always produce the same number, and the scoring rules are inspectable. No model classifies you.",
      },
      {
        q: "Where do the norms come from?",
        a: "From real sessions, and only from real sessions. Until a calibration cohort exists, every result is labeled provisional and no percentile is shown. Published statistics will state their N. This is a hard rule, not a disclaimer.",
      },
      {
        q: "What data does the Taste Gym collect?",
        a: "Anonymized response vectors: ratings, listen durations, item-pool version, and computed scores, keyed to a random per-session id. No account, no name, no email, no third-party tracking cookies.",
      },
    ],
  },
];

export function learnPage(slug: string): LearnPage | undefined {
  return LEARN_PAGES.find((p) => p.slug === slug);
}
