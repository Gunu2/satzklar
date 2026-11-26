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
  verbSprintBestScore: number;
  verbSprintBestStreak: number;
  theme: 'light' | 'dark';
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

export type ActiveTab = 'roadmap' | 'sprint' | 'vault' | 'doctor';
