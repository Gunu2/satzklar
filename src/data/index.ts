import type { CEFRLevel, Exercise, Lesson } from '../types/grammar';

import a1_01 from './lessons/a1-01-gender-articles.json';
import a1_02 from './lessons/a1-02-accusative-objects.json';
import a1_03 from './lessons/a1-03-verb-second-satzklammer.json';
import a2_01 from './lessons/a2-01-dative-case.json';
import a2_02 from './lessons/a2-02-wechselpraepositionen.json';
import a2_03 from './lessons/a2-03-perfekt-past-tense.json';
import b1_01 from './lessons/b1-01-subordinate-clauses.json';
import b1_02 from './lessons/b1-02-adjective-declension.json';
import b1_03 from './lessons/b1-03-praeteritum-modals.json';
import b2_01 from './lessons/b2-01-genitive-prepositions.json';
import b2_02 from './lessons/b2-02-konjunktiv-ii.json';
import b2_03 from './lessons/b2-03-passive-voice-clauses.json';

export const LESSONS: Lesson[] = [
  a1_01 as Lesson,
  a1_02 as Lesson,
  a1_03 as Lesson,
  a2_01 as Lesson,
  a2_02 as Lesson,
  a2_03 as Lesson,
  b1_01 as Lesson,
  b1_02 as Lesson,
  b1_03 as Lesson,
  b2_01 as Lesson,
  b2_02 as Lesson,
  b2_03 as Lesson,
].sort((a, b) => a.order - b.order);

export const CEFR_SECTIONS: Array<{
  level: CEFRLevel;
  name: string;
  tagline: string;
  badgeClasses: string;
}> = [
  {
    level: 'A1',
    name: 'A1 Foundations',
    tagline: 'Noun genders, Accusative direct objects, and the V2 sentence bracket.',
    badgeClasses:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
  },
  {
    level: 'A2',
    name: 'A2 Everyday Structure',
    tagline: 'Dative triggers, Two-Way Prepositions (Wo? vs. Wohin?), and Perfekt past tense.',
    badgeClasses:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
  },
  {
    level: 'B1',
    name: 'B1 Complex Clauses',
    tagline: 'Subordinate verb-final clauses, adjective endings, Präteritum, and TeKaMoLo.',
    badgeClasses:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
  },
  {
    level: 'B2',
    name: 'B2 Nuance & Style',
    tagline: 'Academic Genitive, Konjunktiv II conditionals, passive voice, and relative clauses.',
    badgeClasses:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
  },
];

export const EXERCISE_INDEX: Record<string, { exercise: Exercise; lesson: Lesson }> =
  LESSONS.reduce<Record<string, { exercise: Exercise; lesson: Lesson }>>((acc, lesson) => {
    for (const exercise of lesson.exercises) {
      acc[exercise.id] = { exercise, lesson };
    }
    return acc;
  }, {});

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getTotalExerciseCount(): number {
  return LESSONS.reduce((sum, l) => sum + l.exercises.length, 0);
}
