import type { CEFRLevel } from '../types/grammar';

export interface PlacementQuestion {
  id: string;
  cefr: CEFRLevel;
  prompt: string;
  english: string;
  options: string[];
  correctIndex: number;
  rulePill: string;
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 'pq-1',
    cefr: 'A1',
    prompt: '___ Mädchen liest ein interessantes Buch.',
    english: 'The girl is reading an interesting book.',
    options: ['Der', 'Die', 'Das', 'Den'],
    correctIndex: 2,
    rulePill: "Diminutives ending in '-chen' are always Neuter [N] → 'Das Mädchen'.",
  },
  {
    id: 'pq-2',
    cefr: 'A1',
    prompt: 'Ich kaufe heute ___ neuen Mantel.',
    english: 'Today I am buying a new coat.',
    options: ['ein', 'eine', 'einen', 'einem'],
    correctIndex: 2,
    rulePill: "Direct object of 'kaufen' triggers Accusative → Masculine [M] 'ein' becomes 'einen'.",
  },
  {
    id: 'pq-3',
    cefr: 'A2',
    prompt: 'Sie fährt jeden Tag mit ___ Fahrrad zur Arbeit.',
    english: 'She rides to work by bicycle every day.',
    options: ['das', 'dem', 'den', 'der'],
    correctIndex: 1,
    rulePill: "Preposition 'mit' ALWAYS triggers Dative → Neuter [N] 'das Fahrrad' becomes 'dem Fahrrad'.",
  },
  {
    id: 'pq-4',
    cefr: 'A2',
    prompt: 'Ich stelle die Tasse ___ Tisch.',
    english: 'I place the cup onto the table.',
    options: ['auf dem', 'auf den', 'auf der', 'auf das'],
    correctIndex: 1,
    rulePill: "'stellen' indicates movement (Wohin?) → Accusative → Masculine [M] 'auf den Tisch'.",
  },
  {
    id: 'pq-5',
    cefr: 'B1',
    prompt: 'Ich bleibe zu Hause, weil ich heute keine Zeit ___.',
    english: 'I am staying home because I have no time today.',
    options: ['habe', 'hatte', 'haben', 'bin'],
    correctIndex: 0,
    rulePill: "Subordinating conjunction 'weil' kicks the conjugated verb 'habe' to the very end.",
  },
  {
    id: 'pq-6',
    cefr: 'B1',
    prompt: 'Sie wohnt in einer ___ Wohnung am Fluss.',
    english: 'She lives in a bright apartment by the river.',
    options: ['helle', 'heller', 'hellen', 'helles'],
    correctIndex: 2,
    rulePill: "After any Dative article ('einer'), German adjectives always end in '-en'.",
  },
  {
    id: 'pq-7',
    cefr: 'B2',
    prompt: 'Wegen ___ starken Schneefalls fiel der Zug aus.',
    english: 'Because of the heavy snowfall, the train was canceled.',
    options: ['dem', 'der', 'des', 'den'],
    correctIndex: 2,
    rulePill: "'wegen' takes Genitive → Masculine [M] 'der Schneefall' becomes 'des Schneefalls'.",
  },
  {
    id: 'pq-8',
    cefr: 'B2',
    prompt: 'Das sind die Freunde, mit ___ wir nach Italien fahren.',
    english: 'Those are the friends with whom we are traveling to Italy.',
    options: ['den', 'die', 'denen', 'deren'],
    correctIndex: 2,
    rulePill: "Dative Plural relative pronoun is always 'denen' (after Dative preposition 'mit').",
  },
];

export function computeRecommendedLevel(score: number): {
  level: CEFRLevel;
  headline: string;
  advice: string;
} {
  if (score <= 2) {
    return {
      level: 'A1',
      headline: 'Start at A1 Foundations',
      advice: 'Build rock-solid instincts for der/die/das, Accusative objects, and the V2 sentence bracket.',
    };
  }
  if (score <= 4) {
    return {
      level: 'A2',
      headline: 'Jump into A2 Everyday Structure',
      advice: 'You have the basics! Next up: Dative triggers, Two-Way Prepositions, and Perfekt past tense.',
    };
  }
  if (score <= 6) {
    return {
      level: 'B1',
      headline: 'Ready for B1 Complex Clauses',
      advice: 'Strong foundation! Sharpen subordinate clauses, adjective declension, and TeKaMoLo rhythm.',
    };
  }
  return {
    level: 'B2',
    headline: 'Challenge Yourself with B2 Nuance',
    advice: 'Impressive grammar intuition! Refine Genitive prepositions, Konjunktiv II, passive voice, and relative clauses.',
  };
}
