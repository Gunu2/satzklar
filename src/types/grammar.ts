export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type Gender = 'M' | 'F' | 'N' | 'PL';

export type GrammarCase = 'Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv';

export type SentenceField =
  | 'vorfeld'
  | 'verb2'
  | 'mittelfeld'
  | 'endklammer'
  | 'nebensatz_conj';

export interface NounHint {
  word: string;
  baseForm: string;
  gender: Gender;
  activeCase: GrammarCase;
  caseTrigger: string;
}

export interface BaseExercise {
  id: string;
  cefr: CEFRLevel;
  english: string;
  fullGerman: string;
  ruleTag: string;
  rulePill: string;
}

export interface CaseDrillExercise extends BaseExercise {
  type: 'case_drill';
  prompt: string;
  options: string[];
  correctIndex: number;
  nouns?: NounHint[];
  targetGender?: Gender;
  targetCase?: GrammarCase;
}

export interface SatzklammerToken {
  id: string;
  text: string;
  field: SentenceField;
  gender?: Gender;
}

export interface SatzklammerExercise extends BaseExercise {
  type: 'satzklammer';
  instruction: string;
  tokens: SatzklammerToken[];
  correctOrder: string[];
}

export interface WechselSimExercise extends BaseExercise {
  type: 'wechsel_sim';
  preposition: string;
  noun: {
    word: string;
    baseArticle: string;
    gender: Gender;
    meaning: string;
  };
  staticExample: {
    german: string;
    english: string;
    highlight: string;
  };
  motionExample: {
    german: string;
    english: string;
    highlight: string;
  };
  targetMode: 'wo' | 'wohin';
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface SpotFixExercise extends BaseExercise {
  type: 'spot_fix';
  promptHint: string;
  sentenceTokens: string[];
  errorTokenIndex: number;
  fixOptions: string[];
  correctFixIndex: number;
}

export interface VerbConjugationExercise extends BaseExercise {
  type: 'verb_conjugation';
  infinitive: string;
  tense: 'Präsens' | 'Perfekt' | 'Präteritum' | 'Konjunktiv II' | 'Modal' | 'Passiv';
  subject: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export type Exercise =
  | CaseDrillExercise
  | SatzklammerExercise
  | WechselSimExercise
  | SpotFixExercise
  | VerbConjugationExercise;

export interface CheatSheetPattern {
  formula: string;
  example: string;
  translation: string;
  gender?: Gender;
}

export interface LessonCheatSheet {
  summary: string;
  keyTakeaways: string[];
  patterns: CheatSheetPattern[];
  watchOut: string;
}

export interface Lesson {
  id: string;
  cefr: CEFRLevel;
  order: number;
  title: string;
  germanTitle: string;
  subtitle: string;
  estimatedMinutes: number;
  grammarFocus: string[];
  cheatSheet: LessonCheatSheet;
  exercises: Exercise[];
}

export interface MistakeRecord {
  exerciseId: string;
  lessonId: string;
  cefr: CEFRLevel;
  ruleTag: string;
  rulePill: string;
  wrongCount: number;
  consecutiveRight: number;
  lastMissedAt: string;
  nextReviewAt: string;
}

export interface LessonProgress {
  lessonId: string;
  mastery: number; // 0-100
  bestAccuracy: number; // 0-100
  attempts: number;
  completedAt?: string;
}

export interface UserProgress {
  xp: number;
  streakDays: number;
  lastStudyDate: string | null;
  selectedStartLevel: CEFRLevel | null;
  onboardingCompleted: boolean;
  lessonProgress: Record<string, LessonProgress>;
  mistakes: Record<string, MistakeRecord>;
  examProgress: Record<string, ExamResultRecord>;
  verbSprintBestScore: number;
  verbSprintBestStreak: number;
  theme: 'light' | 'dark';
}

export type ExamInstitute = 'Goethe-Zertifikat' | 'ÖSD' | 'telc';

export interface ExamResultRecord {
  examId: string;
  skill: 'hoeren' | 'schreiben';
  cefr: CEFRLevel;
  bestScore: number; // 0-100
  passed: boolean; // >= 60
  attempts: number;
  completedAt: string;
}

export interface ListeningLine {
  speaker: string;
  voiceRole: 'narrator' | 'speakerA' | 'speakerB';
  text: string;
  english: string;
}

export interface ListeningQuestion {
  id: string;
  format: 'mcq' | 'rf'; // a/b/c multiple choice or Richtig / Falsch
  prompt: string;
  options: string[];
  correctIndex: number;
  evidenceQuote: string;
  explanation: string;
}

export interface ListeningExam {
  id: string;
  cefr: CEFRLevel;
  institute: ExamInstitute;
  partLabel: string; // e.g., "Hören · Teil 1 & 2"
  title: string;
  scenario: string;
  maxPlaysExamMode: 1 | 2;
  recommendedMinutes: number;
  transcript: ListeningLine[];
  keyVocabulary: Array<{ german: string; english: string }>;
  questions: ListeningQuestion[];
}

export interface WritingBulletPoint {
  id: string;
  label: string;
  hint: string;
  detectionKeywords: string[];
}

export interface WritingExam {
  id: string;
  cefr: CEFRLevel;
  institute: ExamInstitute;
  partLabel: string; // e.g., "Schreiben · Teil 1"
  title: string;
  register: 'informal' | 'formal' | 'semi-formal';
  situation: string;
  minWords: number;
  targetWords: number;
  recommendedMinutes: number;
  leitpunkte: WritingBulletPoint[];
  redemittel: Array<{ category: string; phrases: string[] }>;
  modelAnswer: {
    text: string;
    highlightedPhrases: string[];
    examinerNote: string;
  };
}

export interface WritingCriterionScore {
  name: string;
  germanName: string;
  score: number; // 0-25
  maxScore: 25;
  feedback: string;
}

export interface WritingEvaluation {
  source: 'local' | 'gemini';
  totalScore: number; // 0-100
  passed: boolean; // >= 60
  wordCount: number;
  coveredBulletIds: string[];
  criteria: WritingCriterionScore[];
  issues: SentenceIssue[];
  overallFeedback: string;
  improvedDraft?: string;
}

export interface SentenceIssue {
  id: string;
  severity: 'error' | 'warning' | 'tip';
  category: string;
  fragment: string;
  suggestion: string;
  rulePill: string;
}

export interface SentenceAnalysisResult {
  source: 'local' | 'gemini';
  original: string;
  corrected: string;
  issues: SentenceIssue[];
  b1Rewrite?: string;
  b2Rewrite?: string;
  praise?: string;
}

export type ActiveTab = 'roadmap' | 'vocab' | 'exam' | 'chat' | 'sprint' | 'vault' | 'doctor';
