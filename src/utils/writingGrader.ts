import type {
  SentenceIssue,
  WritingCriterionScore,
  WritingEvaluation,
  WritingExam,
} from '../types/grammar';
import { analyzeSentenceLocally } from './sentenceDoctor';

export function countGermanWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function detectCoveredBullets(exam: WritingExam, draft: string): string[] {
  const lower = draft.toLowerCase();
  const covered: string[] = [];

  for (const bullet of exam.leitpunkte) {
    const matched = bullet.detectionKeywords.some((kw) =>
      lower.includes(kw.toLowerCase())
    );
    if (matched) {
      covered.push(bullet.id);
    }
  }
  return covered;
}

const INFORMAL_GREETINGS = ['hallo', 'liebe ', 'lieber ', 'hi ', 'hey '];
const FORMAL_GREETINGS = ['sehr geehrte', 'guten tag'];
const INFORMAL_SIGNOFFS = ['liebe grüße', 'viele grüße', 'bis bald', 'dein ', 'deine ', 'lg'];
const FORMAL_SIGNOFFS = ['mit freundlichen grüßen', 'freundliche grüße', 'hochachtungsvoll'];
const CONNECTORS = [
  'weil',
  'dass',
  'obwohl',
  'wenn',
  'deshalb',
  'deswegen',
  'außerdem',
  'jedoch',
  'allerdings',
  'einerseits',
  'andererseits',
  'darüber hinaus',
  'trotzdem',
  'aber',
  'denn',
  'und',
  'oder',
  'zuerst',
  'schließlich',
  'meiner meinung nach',
];

/**
 * 100% offline Goethe / ÖSD / telc 4-criterion rubric grader (0-100 Punkte, pass >= 60).
 */
export function evaluateWritingLocally(
  exam: WritingExam,
  rawDraft: string
): WritingEvaluation {
  const draft = rawDraft.trim();
  const wordCount = countGermanWords(draft);
  const lower = draft.toLowerCase();
  const coveredBulletIds = detectCoveredBullets(exam, draft);

  // 1. Aufgabenerfüllung (Task Completion & Word Count: 0-25)
  const bulletRatio =
    exam.leitpunkte.length > 0
      ? coveredBulletIds.length / exam.leitpunkte.length
      : 1;
  const wordRatio = Math.min(1, wordCount / Math.max(1, exam.minWords));
  const taskScore = Math.round(bulletRatio * 17 + wordRatio * 8);

  const taskFeedback =
    coveredBulletIds.length === exam.leitpunkte.length && wordCount >= exam.minWords
      ? `All ${exam.leitpunkte.length} Leitpunkte addressed and target length reached (${wordCount} words).`
      : `Covered ${coveredBulletIds.length}/${exam.leitpunkte.length} Leitpunkte (${wordCount}/${exam.minWords}+ words). Make sure every bullet point gets its own clear sentence!`;

  // 2. Kohärenz & Struktur (Greeting, Connectors, Sign-off / Paragraphs: 0-25)
  const hasGreeting =
    INFORMAL_GREETINGS.some((g) => lower.includes(g)) ||
    FORMAL_GREETINGS.some((g) => lower.includes(g));
  const hasSignoff =
    INFORMAL_SIGNOFFS.some((s) => lower.includes(s)) ||
    FORMAL_SIGNOFFS.some((s) => lower.includes(s));
  const usedConnectors = CONNECTORS.filter((c) => lower.includes(c));
  const isForumOrEssay =
    exam.title.toLowerCase().includes('forum') ||
    exam.title.toLowerCase().includes('meinung') ||
    exam.title.toLowerCase().includes('stellungnahme');

  let structureScore = 8;
  if (isForumOrEssay) {
    // Forum essays value intro + connectors + paragraphs
    const paragraphCount = draft.split(/\n\s*\n/).filter((p) => p.trim()).length;
    structureScore = Math.min(
      25,
      8 + Math.min(11, usedConnectors.length * 3) + (paragraphCount >= 2 ? 6 : 2)
    );
  } else {
    structureScore = Math.min(
      25,
      6 + (hasGreeting ? 6 : 0) + (hasSignoff ? 6 : 0) + Math.min(7, usedConnectors.length * 2.5)
    );
  }
  structureScore = Math.round(structureScore);

  const structureFeedback = isForumOrEssay
    ? `Detected ${usedConnectors.length} discourse connector(s) (${usedConnectors.slice(0, 4).join(', ') || 'none yet'}). Use clear paragraphs and connectors like 'deshalb', 'einerseits', 'obwohl'.`
    : `${hasGreeting ? 'Greeting ✓' : 'Missing greeting'} · ${hasSignoff ? 'Sign-off ✓' : 'Missing closing phrase'} · ${usedConnectors.length} connector(s) used.`;

  // 3. Register & Ausdruck (Formal Sie vs Informal du + Vocabulary variety: 0-25)
  const hasInformalPronoun = /\b(du|dich|dir|dein|deine|deinen)\b/i.test(draft);
  const hasFormalPronoun = /\b(Sie|Ihnen|Ihr|Ihre|Ihren)\b/.test(draft);
  let registerPenalty = 0;
  let registerNote = '';

  if (exam.register === 'formal' && hasInformalPronoun) {
    registerPenalty = 8;
    registerNote = 'Watch register! This is a formal exam task—use polite "Sie / Ihnen", not "du / dir".';
  } else if (exam.register === 'informal' && hasFormalPronoun) {
    registerPenalty = 6;
    registerNote = 'This message is to a friend—use warm informal "du / dir" instead of formal "Sie".';
  } else if (exam.register === 'formal' && hasFormalPronoun) {
    registerNote = 'Appropriate formal "Sie" register maintained.';
  } else if (exam.register === 'informal' && hasInformalPronoun) {
    registerNote = 'Natural informal "du" register maintained.';
  } else {
    registerNote = 'Register looks consistent; try weaving in 2–3 exam Redemittel phrases for higher marks.';
  }

  const uniqueWords = new Set(
    (lower.match(/[a-zäöüß]{3,}/g) ?? [])
  ).size;
  const lexicalBonus = Math.min(12, Math.round(uniqueWords / 3));
  const expressionScore = Math.max(
    4,
    Math.min(25, 13 + lexicalBonus - registerPenalty)
  );

  // 4. Grammatik & Korrektheit (Sentence-by-sentence heuristic check: 0-25)
  const sentences = draft
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  const allIssues: SentenceIssue[] = [];
  const seenIds = new Set<string>();
  for (const s of sentences) {
    const analysis = analyzeSentenceLocally(s);
    for (const issue of analysis.issues) {
      const key = `${issue.category}:${issue.fragment.toLowerCase()}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        allIssues.push(issue);
      }
    }
  }

  const errorCount = allIssues.filter((i) => i.severity === 'error').length;
  const warningCount = allIssues.filter((i) => i.severity !== 'error').length;
  const grammarBase = wordCount >= Math.max(15, exam.minWords * 0.5) ? 24 : 15;
  const grammarScore = Math.max(
    5,
    Math.min(25, grammarBase - errorCount * 3 - warningCount * 1)
  );

  const grammarFeedback =
    allIssues.length === 0
      ? 'No major offline grammar errors flagged! Compare with the Musterlösung below to polish natural phrasing.'
      : `Found ${allIssues.length} grammar/capitalization item(s) to polish—review the Rule Pills below.`;

  const criteria: WritingCriterionScore[] = [
    {
      name: 'Task Completion',
      germanName: 'Aufgabenerfüllung',
      score: taskScore,
      maxScore: 25,
      feedback: taskFeedback,
    },
    {
      name: 'Coherence & Structure',
      germanName: 'Kohärenz & Struktur',
      score: structureScore,
      maxScore: 25,
      feedback: structureFeedback,
    },
    {
      name: 'Register & Expression',
      germanName: 'Ausdruck & Register',
      score: expressionScore,
      maxScore: 25,
      feedback: registerNote,
    },
    {
      name: 'Grammar & Accuracy',
      germanName: 'Korrektheit',
      score: grammarScore,
      maxScore: 25,
      feedback: grammarFeedback,
    },
  ];

  const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);
  const passed = totalScore >= 60;

  return {
    source: 'local',
    totalScore,
    passed,
    wordCount,
    coveredBulletIds,
    criteria,
    issues: allIssues,
    overallFeedback: passed
      ? `Bestanden (${totalScore}/100)! Solid ${exam.cefr} exam response. Study the Musterlösung below to turn a pass into a 90+ score.`
      : `Noch nicht bestanden (${totalScore}/100 — pass mark is 60). Address all ${exam.leitpunkte.length} Leitpunkte, hit at least ${exam.minWords} words, and fix the flagged grammar pills.`,
  };
}

/**
 * Optional BYOK Gemini Examiner using official Goethe/ÖSD/telc 4-criterion grading rubric.
 */
export async function evaluateWritingWithGemini(
  exam: WritingExam,
  draft: string,
  apiKey: string
): Promise<WritingEvaluation> {
  const wordCount = countGermanWords(draft);
  const bulletText = exam.leitpunkte
    .map((b, i) => `${i + 1}. (${b.id}) ${b.label}`)
    .join('\n');

  const prompt = `You are a certified ${exam.institute} ${exam.cefr} German examiner.
Grade the learner's Schreiben response strictly according to official ${exam.institute} ${exam.cefr} criteria.
Return ONLY valid JSON (no markdown fences) matching this exact schema:
{
  "coveredBulletIds": ["id1", "id2"],
  "overallFeedback": "2-sentence encouraging examiner verdict in English with key advice",
  "improvedDraft": "polished natural ${exam.cefr}-level German version of the learner's text",
  "criteria": [
    { "name": "Task Completion", "germanName": "Aufgabenerfüllung", "score": 0-25, "maxScore": 25, "feedback": "1 concise sentence" },
    { "name": "Coherence & Structure", "germanName": "Kohärenz & Struktur", "score": 0-25, "maxScore": 25, "feedback": "1 concise sentence" },
    { "name": "Register & Expression", "germanName": "Ausdruck & Register", "score": 0-25, "maxScore": 25, "feedback": "1 concise sentence" },
    { "name": "Grammar & Accuracy", "germanName": "Korrektheit", "score": 0-25, "maxScore": 25, "feedback": "1 concise sentence" }
  ],
  "issues": [
    {
      "id": "e1",
      "severity": "error" | "warning" | "tip",
      "category": "short grammar label",
      "fragment": "exact flawed phrase from learner text",
      "suggestion": "corrected German phrase",
      "rulePill": "bite-sized explanation of why"
    }
  ]
}

Task: ${exam.institute} ${exam.cefr} — ${exam.title} (Register: ${exam.register}, Target: ~${exam.targetWords} words)
Situation: ${exam.situation}
Required Leitpunkte:
${bulletText}

Learner text (${wordCount} words):
"""
${draft}
"""`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API responded with status ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  const parsed = JSON.parse(cleaned) as Partial<WritingEvaluation>;

  const criteria = Array.isArray(parsed.criteria) && parsed.criteria.length === 4
    ? parsed.criteria.map((c) => ({
        ...c,
        score: Math.max(0, Math.min(25, Math.round(Number(c.score) || 0))),
        maxScore: 25 as const,
      }))
    : evaluateWritingLocally(exam, draft).criteria;

  const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);

  return {
    source: 'gemini',
    totalScore,
    passed: totalScore >= 60,
    wordCount,
    coveredBulletIds: Array.isArray(parsed.coveredBulletIds)
      ? parsed.coveredBulletIds
      : detectCoveredBullets(exam, draft),
    criteria,
    issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    overallFeedback:
      parsed.overallFeedback ||
      `Scored ${totalScore}/100 under ${exam.institute} ${exam.cefr} criteria.`,
    improvedDraft: parsed.improvedDraft,
  };
}
