import type {
  FullWritingPaper,
  FullWritingPaperEvaluation,
  FullWritingTask,
  FullWritingTaskGrade,
  GradeBand,
  OfficialCriterionGrade,
} from '../types/fullExam';
import type { SentenceIssue } from '../types/grammar';
import { analyzeSentenceLocally } from './sentenceDoctor';
import { countGermanWords } from './writingGrader';

const BAND_MULTIPLIER: Record<GradeBand, number> = {
  A: 1.0,
  B: 0.75,
  C: 0.5,
  D: 0.25,
  E: 0,
};

function ratioToBand(ratio: number): GradeBand {
  if (ratio >= 0.86) return 'A';
  if (ratio >= 0.68) return 'B';
  if (ratio >= 0.48) return 'C';
  if (ratio >= 0.25) return 'D';
  return 'E';
}

function roundHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

const INFORMAL_GREETINGS = ['hallo', 'liebe ', 'lieber ', 'hi '];
const FORMAL_GREETINGS = ['sehr geehrte', 'guten tag', 'liebe frau', 'lieber herr'];
const INFORMAL_SIGNOFFS = ['liebe grüße', 'herzliche grüße', 'viele grüße', 'bis bald', 'dein ', 'deine '];
const FORMAL_SIGNOFFS = ['mit freundlichen grüßen', 'freundliche grüße'];
const DISCOURSE_CONNECTORS = [
  'weil',
  'dass',
  'obwohl',
  'wenn',
  'deshalb',
  'deswegen',
  'trotzdem',
  'außerdem',
  'darüber hinaus',
  'einerseits',
  'andererseits',
  'auf der einen seite',
  'auf der anderen seite',
  'denn',
  'aber',
  'jedoch',
  'allerdings',
  'damit',
  'sodass',
  'meiner meinung nach',
  'ich bin der ansicht',
  'zusammenfassend',
  'abschließend',
];

function gradeSingleTaskLocally(
  task: FullWritingTask,
  rawDraft: string
): FullWritingTaskGrade {
  const draft = rawDraft.trim();
  const lower = draft.toLowerCase();
  const wordCount = countGermanWords(draft);

  const coveredBulletIds = task.leitpunkte
    .filter((lp) =>
      lp.detectionKeywords.some((kw) => lower.includes(kw.toLowerCase()))
    )
    .map((lp) => lp.id);

  // Official Goethe/ÖSD rule: < 50% of required word count triggers Erfüllung = E (0 points for entire task!)
  const underHalfWords = wordCount < Math.floor(task.minWords * 0.5);
  const bulletRatio =
    task.leitpunkte.length > 0
      ? coveredBulletIds.length / task.leitpunkte.length
      : 1;
  const lengthRatio = Math.min(1, wordCount / Math.max(1, task.minWords));

  // 1. Erfüllung
  const erfuellungBand: GradeBand = underHalfWords
    ? 'E'
    : ratioToBand(bulletRatio * 0.68 + lengthRatio * 0.32);

  // 2. Kohärenz
  const isForum = task.register === 'semi-formal';
  const hasGreeting =
    INFORMAL_GREETINGS.some((g) => lower.includes(g)) ||
    FORMAL_GREETINGS.some((g) => lower.includes(g));
  const hasSignoff =
    INFORMAL_SIGNOFFS.some((s) => lower.includes(s)) ||
    FORMAL_SIGNOFFS.some((s) => lower.includes(s));
  const connectorCount = DISCOURSE_CONNECTORS.filter((c) => lower.includes(c)).length;
  const paragraphs = draft.split(/\n\s*\n/).filter((p) => p.trim()).length;

  let kohaerenzRatio = 0;
  if (isForum) {
    kohaerenzRatio =
      Math.min(0.65, connectorCount * 0.16) +
      (paragraphs >= 2 ? 0.35 : 0.18);
  } else {
    kohaerenzRatio =
      (hasGreeting ? 0.3 : 0) +
      (hasSignoff ? 0.3 : 0) +
      Math.min(0.4, connectorCount * 0.14);
  }
  const kohaerenzBand: GradeBand = underHalfWords ? 'E' : ratioToBand(kohaerenzRatio);

  // 3. Wortschatz & Register
  const hasDu = /\b(du|dich|dir|dein|deine|deinen)\b/i.test(draft);
  const hasSie = /\b(Sie|Ihnen|Ihr|Ihre|Ihren)\b/.test(draft);
  let registerPenalty = 0;
  let registerHint = 'Register matches task audience.';
  if (task.register === 'formal' && hasDu) {
    registerPenalty = 0.25;
    registerHint = 'Register mismatch: use formal "Sie / Ihnen" instead of "du / dir".';
  } else if (task.register === 'informal' && hasSie) {
    registerPenalty = 0.2;
    registerHint = 'Register mismatch: use friendly informal "du / dir" for a friend.';
  }
  const uniqueTokens = new Set((lower.match(/[a-zäöüß]{3,}/g) ?? [])).size;
  const vocabTarget = Math.max(18, Math.round(task.targetWords * 0.45));
  const wortschatzRatio = Math.max(
    0,
    Math.min(1, uniqueTokens / vocabTarget) - registerPenalty
  );
  const wortschatzBand: GradeBand = underHalfWords ? 'E' : ratioToBand(wortschatzRatio);

  // 4. Strukturen (Grammar & Orthography)
  const sentences = draft
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  const issues: SentenceIssue[] = [];
  const seen = new Set<string>();
  for (const s of sentences) {
    const res = analyzeSentenceLocally(s);
    for (const issue of res.issues) {
      const key = `${issue.category}:${issue.fragment.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        issues.push(issue);
      }
    }
  }
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity !== 'error').length;
  const hasSubordinate = /\b(weil|dass|obwohl|wenn|damit|ob|als)\b/i.test(draft);
  const structRatio = Math.max(
    0,
    Math.min(1, (hasSubordinate ? 0.96 : 0.82) - errors * 0.14 - warnings * 0.05)
  );
  const strukturenBand: GradeBand = underHalfWords ? 'E' : ratioToBand(structRatio);

  const zeroed = erfuellungBand === 'E';

  const criteria: OfficialCriterionGrade[] = [
    {
      criterion: 'Erfüllung',
      band: erfuellungBand,
      points: zeroed ? 0 : roundHalf(task.weights.erfuellung * BAND_MULTIPLIER[erfuellungBand]),
      maxPoints: task.weights.erfuellung,
      note: underHalfWords
        ? `Under 50% of required length (${wordCount}/${task.minWords} min words) — Goethe/ÖSD scores Erfüllung = E (0 pts).`
        : `Covered ${coveredBulletIds.length}/${task.leitpunkte.length} Leitpunkte (${wordCount} words).`,
    },
    {
      criterion: 'Kohärenz',
      band: kohaerenzBand,
      points: zeroed ? 0 : roundHalf(task.weights.kohaerenz * BAND_MULTIPLIER[kohaerenzBand]),
      maxPoints: task.weights.kohaerenz,
      note: isForum
        ? `${connectorCount} connectors · ${paragraphs} paragraph(s).`
        : `${hasGreeting ? 'Anrede ✓' : 'Missing Anrede'} · ${hasSignoff ? 'Schluss ✓' : 'Missing Gruß'} · ${connectorCount} connectors.`,
    },
    {
      criterion: 'Wortschatz',
      band: wortschatzBand,
      points: zeroed ? 0 : roundHalf(task.weights.wortschatz * BAND_MULTIPLIER[wortschatzBand]),
      maxPoints: task.weights.wortschatz,
      note: `${uniqueTokens} unique words · ${registerHint}`,
    },
    {
      criterion: 'Strukturen',
      band: strukturenBand,
      points: zeroed ? 0 : roundHalf(task.weights.strukturen * BAND_MULTIPLIER[strukturenBand]),
      maxPoints: task.weights.strukturen,
      note:
        issues.length === 0
          ? `${hasSubordinate ? 'Good Nebensatz variety! ' : ''}No major offline syntax errors flagged.`
          : `${issues.length} grammar/spelling item(s) flagged below.`,
    },
  ];

  const totalPoints = zeroed
    ? 0
    : roundHalf(criteria.reduce((sum, c) => sum + c.points, 0));

  return {
    taskId: task.id,
    label: task.label,
    title: task.title,
    wordCount,
    coveredBulletIds,
    totalPoints,
    maxPoints: task.maxPoints,
    zeroedByErfuellungE: zeroed,
    criteria,
    issues,
  };
}

export function evaluateFullWritingPaperLocally(
  paper: FullWritingPaper,
  drafts: Record<string, string>
): FullWritingPaperEvaluation {
  const taskGrades = paper.tasks.map((task) =>
    gradeSingleTaskLocally(task, drafts[task.id] ?? '')
  );

  const totalPoints = roundHalf(
    taskGrades.reduce((sum, g) => sum + g.totalPoints, 0)
  );
  const passed = totalPoints >= paper.passThreshold;

  return {
    source: 'local',
    totalPoints,
    passed,
    taskGrades,
    overallVerdict: passed
      ? `Bestanden (${totalPoints} / 100 Punkte)! You cleared the official ${paper.institute} ${paper.cefr} pass threshold (60 Punkte). Review each Aufgabe's A–E grade matrix and Musterlösung below.`
      : `Noch nicht bestanden (${totalPoints} / 100 Punkte — pass threshold is 60). Complete every Aufgabe above the minimum word count and address all Leitpunkte.`,
  };
}
