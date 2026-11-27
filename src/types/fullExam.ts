import type { CEFRLevel, ExamInstitute, ListeningLine, SentenceIssue, WritingBulletPoint } from './grammar';

export interface ListeningClip {
  id: string;
  label: string; // e.g., "Text 1", "Führung", "Gespräch", "Radiodiskussion"
  intro: string;
  lines: ListeningLine[];
}

export interface FullListeningItem {
  number: number; // 1..30
  clipId: string;
  format: 'rf' | 'mcq' | 'speaker_matrix';
  prompt: string;
  options: string[]; // ['Richtig', 'Falsch'] or ['a) ...', 'b) ...', 'c) ...'] or speaker names
  correctIndex: number;
  evidenceQuote: string;
  explanation: string;
}

export interface FullListeningSection {
  partNumber: 1 | 2 | 3 | 4;
  title: string; // e.g., "Teil 1"
  subtitle: string; // e.g., "5 kurze Texte · Richtig/Falsch & a/b/c"
  instructions: string;
  playsAllowed: 1 | 2;
  readingPrepSeconds: number;
  speakerColumns?: [string, string, string]; // Used for Teil 4 "Wer sagt was?" matrix
  clips: ListeningClip[];
  items: FullListeningItem[];
}

export interface FullListeningPaper {
  id: string;
  cefr: CEFRLevel;
  institute: ExamInstitute;
  badgeColor: string;
  title: string;
  subtitle: string;
  durationMinutes: number; // e.g., 40
  totalItems: number; // 30
  passThreshold: number; // 60
  sections: FullListeningSection[];
}

export interface WritingCriterionWeight {
  erfuellung: number; // e.g. 10 or 4 or 15
  kohaerenz: number;
  wortschatz: number;
  strukturen: number;
}

export interface GuestbookStimulus {
  siteUrl: string;
  author: string;
  timestamp: string;
  quote: string;
}

export interface FullWritingTask {
  id: string;
  partNumber: number;
  label: string; // e.g., "Aufgabe 1"
  title: string;
  recommendedMinutes: number;
  maxPoints: number; // 40, 40, 20 (B1) or 60, 40 (B2)
  weights: WritingCriterionWeight;
  register: 'informal' | 'formal' | 'semi-formal';
  minWords: number;
  targetWords: number;
  situation: string;
  guestbookStimulus?: GuestbookStimulus;
  leitpunkte: WritingBulletPoint[];
  modelAnswer: {
    text: string;
    highlightedPhrases: string[];
    examinerNote: string;
  };
}

export interface RedemittelGroup {
  section: string;
  category: string;
  phrases: string[];
}

export interface FullWritingPaper {
  id: string;
  cefr: CEFRLevel;
  institute: ExamInstitute;
  badgeColor: string;
  title: string;
  subtitle: string;
  durationMinutes: number; // 60 (B1) or 75 (B2)
  totalPoints: 100;
  passThreshold: 60;
  tasks: FullWritingTask[];
  redemittelBank: RedemittelGroup[];
  konnektoren: Array<{
    group: string;
    rule: string;
    words: string[];
  }>;
}

export type GradeBand = 'A' | 'B' | 'C' | 'D' | 'E';

export interface OfficialCriterionGrade {
  criterion: 'Erfüllung' | 'Kohärenz' | 'Wortschatz' | 'Strukturen';
  band: GradeBand;
  points: number;
  maxPoints: number;
  note: string;
}

export interface FullWritingTaskGrade {
  taskId: string;
  label: string;
  title: string;
  wordCount: number;
  coveredBulletIds: string[];
  totalPoints: number;
  maxPoints: number;
  zeroedByErfuellungE: boolean;
  criteria: OfficialCriterionGrade[];
  issues: SentenceIssue[];
}

export interface FullWritingPaperEvaluation {
  source: 'local' | 'gemini';
  totalPoints: number; // 0-100
  passed: boolean; // >= 60
  taskGrades: FullWritingTaskGrade[];
  overallVerdict: string;
}
