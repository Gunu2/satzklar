import type { CEFRLevel } from '../../types/grammar';
import type { VocabItem } from '../../types/vocab';
import { VOCAB_A1 } from './vocabA1';
import { VOCAB_A2 } from './vocabA2';
import { VOCAB_B1 } from './vocabB1';
import { VOCAB_B2 } from './vocabB2';

/**
 * Guarantees strict global uniqueness across A1 -> A2 -> B1 -> B2
 * so learners NEVER encounter duplicate words as they progress through levels.
 */
function buildDeduplicatedDeck(items: VocabItem[]): VocabItem[] {
  const seen = new Set<string>();
  const unique: VocabItem[] = [];
  for (const item of items) {
    const key = item.lemma.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }
  return unique;
}

export const ALL_VOCAB: VocabItem[] = buildDeduplicatedDeck([
  ...VOCAB_A1,
  ...VOCAB_A2,
  ...VOCAB_B1,
  ...VOCAB_B2,
]);

export const VOCAB_BY_LEVEL: Record<CEFRLevel, VocabItem[]> = {
  A1: ALL_VOCAB.filter((v) => v.cefr === 'A1'),
  A2: ALL_VOCAB.filter((v) => v.cefr === 'A2'),
  B1: ALL_VOCAB.filter((v) => v.cefr === 'B1'),
  B2: ALL_VOCAB.filter((v) => v.cefr === 'B2'),
};

export const VOCAB_INDEX: Record<string, VocabItem> = Object.fromEntries(
  ALL_VOCAB.map((item) => [item.id, item])
);
