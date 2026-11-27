import type { CEFRLevel, Gender } from './grammar';

export type VocabPOS = 'Nomen' | 'Verb' | 'Adjektiv' | 'Ausdruck';

export interface VocabItem {
  id: string;
  cefr: CEFRLevel;
  word: string; // Full German headword (e.g. "der Bahnhof" or "vermeiden")
  lemma: string; // Bare German word for strict deduplication
  gender?: Gender;
  extraForm?: string; // Plural for nouns (e.g. "die Bahnhöfe") or Perfekt for verbs (e.g. "hat vermieden")
  pos: VocabPOS;
  topic: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
}

export type DailyVocabGoal = 5 | 10 | 15 | 20;

export interface VocabMemoryState {
  dailyGoal: DailyVocabGoal;
  startDate: string; // YYYY-MM-DD
  memorizedIds: string[]; // Permanently memorized (never repeated in new-word queue)
  reviewIds: string[]; // Marked "Still learning" for quick review
  dailyLog: Record<string, number>; // YYYY-MM-DD -> newly memorized count
  focusLevel: 'auto' | CEFRLevel;
}
