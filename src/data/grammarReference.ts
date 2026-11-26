import type { Gender } from '../types/grammar';

export interface ArticleRow {
  caseName: 'Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv';
  question: string;
  M: string;
  F: string;
  N: string;
  PL: string;
}

export const DEFINITE_ARTICLES: ArticleRow[] = [
  { caseName: 'Nominativ', question: 'Wer / Was?', M: 'der', F: 'die', N: 'das', PL: 'die' },
  { caseName: 'Akkusativ', question: 'Wen / Was?', M: 'den', F: 'die', N: 'das', PL: 'die' },
  { caseName: 'Dativ', question: 'Wem?', M: 'dem', F: 'der', N: 'dem', PL: 'den (+n)' },
  { caseName: 'Genitiv', question: 'Wessen?', M: 'des (+s)', F: 'der', N: 'des (+s)', PL: 'der' },
];

export const INDEFINITE_ARTICLES: ArticleRow[] = [
  { caseName: 'Nominativ', question: 'Wer / Was?', M: 'ein', F: 'eine', N: 'ein', PL: 'keine' },
  { caseName: 'Akkusativ', question: 'Wen / Was?', M: 'einen', F: 'eine', N: 'ein', PL: 'keine' },
  { caseName: 'Dativ', question: 'Wem?', M: 'einem', F: 'einer', N: 'einem', PL: 'keinen (+n)' },
  { caseName: 'Genitiv', question: 'Wessen?', M: 'eines (+s)', F: 'einer', N: 'eines (+s)', PL: 'keiner' },
];

export const PREPOSITION_GROUPS = [
  {
    caseName: 'Akkusativ',
    badge: 'ALWAYS AKK',
    mnemonic: 'DOGFU',
    description: 'Direct movement, opposition, or purpose.',
    items: [
      { prep: 'durch', meaning: 'through', example: 'durch den Park' },
      { prep: 'ohne', meaning: 'without', example: 'ohne meinen Schlüssel' },
      { prep: 'gegen', meaning: 'against / around', example: 'gegen die Wand' },
      { prep: 'für', meaning: 'for', example: 'für einen Freund' },
      { prep: 'um', meaning: 'around / at (time)', example: 'um den Tisch' },
    ],
  },
  {
    caseName: 'Dativ',
    badge: 'ALWAYS DAT',
    mnemonic: 'Aus-Bei-Mit-Nach-Seit-Von-Zu',
    description: 'Origin, accompaniment, destination, or duration.',
    items: [
      { prep: 'mit', meaning: 'with / by (transport)', example: 'mit dem Bus' },
      { prep: 'nach', meaning: 'after / to (cities)', example: 'nach der Arbeit' },
      { prep: 'aus', meaning: 'out of / from', example: 'aus dem Haus' },
      { prep: 'zu', meaning: 'to (people / places)', example: 'zur Schule (zu der)' },
      { prep: 'von', meaning: 'from / of', example: 'vom Bahnhof (von dem)' },
      { prep: 'bei', meaning: 'at / near / with', example: 'beim Arzt (bei dem)' },
      { prep: 'seit', meaning: 'since / for (time)', example: 'seit einem Jahr' },
    ],
  },
  {
    caseName: 'Wechselpräpositionen',
    badge: 'WO? DAT · WOHIN? AKK',
    mnemonic: '9 Two-Way Prepositions',
    description: 'Static location (Wo?) → Dative. Directional movement (Wohin?) → Accusative.',
    items: [
      { prep: 'in', meaning: 'in / into', example: 'im Kino (Dat) vs. ins Kino (Akk)' },
      { prep: 'an', meaning: 'at / onto (vertical)', example: 'an der Wand vs. an die Wand' },
      { prep: 'auf', meaning: 'on / onto (horizontal)', example: 'auf dem Tisch vs. auf den Tisch' },
      { prep: 'unter', meaning: 'under', example: 'unter dem Bett vs. unter das Bett' },
      { prep: 'über', meaning: 'over / above', example: 'über dem Sofa vs. über das Sofa' },
      { prep: 'vor', meaning: 'in front of', example: 'vor dem Haus vs. vor das Haus' },
      { prep: 'hinter', meaning: 'behind', example: 'hinter dem Auto vs. hinter das Auto' },
      { prep: 'neben', meaning: 'next to', example: 'neben der Tür vs. neben die Tür' },
      { prep: 'zwischen', meaning: 'between', example: 'zwischen den Stühlen' },
    ],
  },
  {
    caseName: 'Genitiv',
    badge: 'B2 · GENITIV',
    mnemonic: 'Wegen · Trotz · Während · Statt',
    description: 'Academic, journalistic, and formal connectors.',
    items: [
      { prep: 'wegen', meaning: 'because of', example: 'wegen des Regens' },
      { prep: 'trotz', meaning: 'despite', example: 'trotz der Kälte' },
      { prep: 'während', meaning: 'during', example: 'während des Urlaubs' },
      { prep: 'statt / anstatt', meaning: 'instead of', example: 'statt eines Autos' },
    ],
  },
];

export const ADJECTIVE_ENDINGS = {
  weak: {
    title: 'After Definite Articles (der, die, das, dieser)',
    tip: 'Only -e and -en exist! Nominative singular & Accusative F/N take -e; everything else takes -en.',
    rows: [
      { caseName: 'Nominativ', M: 'der gute', F: 'die gute', N: 'das gute', PL: 'die guten' },
      { caseName: 'Akkusativ', M: 'den guten', F: 'die gute', N: 'das gute', PL: 'die guten' },
      { caseName: 'Dativ', M: 'dem guten', F: 'der guten', N: 'dem guten', PL: 'den guten' },
      { caseName: 'Genitiv', M: 'des guten', F: 'der guten', N: 'des guten', PL: 'der guten' },
    ],
  },
  mixed: {
    title: 'After Indefinite / Possessive Articles (ein, kein, mein)',
    tip: 'Where ein/mein has NO gender signal (Nom M/N, Akk N), the adjective steps up (-er / -es). Everywhere else: -e or -en.',
    rows: [
      { caseName: 'Nominativ', M: 'ein guter', F: 'eine gute', N: 'ein gutes', PL: 'meine guten' },
      { caseName: 'Akkusativ', M: 'einen guten', F: 'eine gute', N: 'ein gutes', PL: 'meine guten' },
      { caseName: 'Dativ', M: 'einem guten', F: 'einer guten', N: 'einem guten', PL: 'meinen guten' },
      { caseName: 'Genitiv', M: 'eines guten', F: 'einer guten', N: 'eines guten', PL: 'meiner guten' },
    ],
  },
  strong: {
    title: 'Without Article (Strong Endings: Kaffee, Wasser, Plural)',
    tip: 'The adjective copies the definite article ending itself (der → -er, die → -e, das → -es, dem → -em).',
    rows: [
      { caseName: 'Nominativ', M: 'guter Wein', F: 'gute Milch', N: 'gutes Brot', PL: 'gute Freunde' },
      { caseName: 'Akkusativ', M: 'guten Wein', F: 'gute Milch', N: 'gutes Brot', PL: 'gute Freunde' },
      { caseName: 'Dativ', M: 'gutem Wein', F: 'guter Milch', N: 'gutem Brot', PL: 'guten Freunden' },
      { caseName: 'Genitiv', M: 'guten Weins', F: 'guter Milch', N: 'guten Brots', PL: 'guter Freunde' },
    ],
  },
};

export const GENDER_META: Record<
  Gender,
  { label: string; short: string; article: string; hex: string }
> = {
  M: { label: 'Masculine', short: '[M]', article: 'der', hex: '#2563EB' },
  F: { label: 'Feminine', short: '[F]', article: 'die', hex: '#E11D48' },
  N: { label: 'Neuter', short: '[N]', article: 'das', hex: '#059669' },
  PL: { label: 'Plural', short: '[PL]', article: 'die [Pl.]', hex: '#D97706' },
};
