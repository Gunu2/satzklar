import type { SentenceAnalysisResult, SentenceIssue } from '../types/grammar';

interface NounGenderEntry {
  article: 'der' | 'die' | 'das';
  genderLabel: string;
}

const COMMON_NOUNS: Record<string, NounGenderEntry> = {
  mann: { article: 'der', genderLabel: 'Masculine [M]' },
  frau: { article: 'die', genderLabel: 'Feminine [F]' },
  kind: { article: 'das', genderLabel: 'Neuter [N]' },
  hund: { article: 'der', genderLabel: 'Masculine [M]' },
  katze: { article: 'die', genderLabel: 'Feminine [F]' },
  buch: { article: 'das', genderLabel: 'Neuter [N]' },
  tisch: { article: 'der', genderLabel: 'Masculine [M]' },
  stuhl: { article: 'der', genderLabel: 'Masculine [M]' },
  bus: { article: 'der', genderLabel: 'Masculine [M]' },
  zug: { article: 'der', genderLabel: 'Masculine [M]' },
  auto: { article: 'das', genderLabel: 'Neuter [N]' },
  haus: { article: 'das', genderLabel: 'Neuter [N]' },
  schule: { article: 'die', genderLabel: 'Feminine [F]' },
  arbeit: { article: 'die', genderLabel: 'Feminine [F]' },
  stadt: { article: 'die', genderLabel: 'Feminine [F]' },
  freund: { article: 'der', genderLabel: 'Masculine [M]' },
  freundin: { article: 'die', genderLabel: 'Feminine [F]' },
  kaffee: { article: 'der', genderLabel: 'Masculine [M]' },
  wasser: { article: 'das', genderLabel: 'Neuter [N]' },
  bahn: { article: 'die', genderLabel: 'Feminine [F]' },
  zeit: { article: 'die', genderLabel: 'Feminine [F]' },
  tag: { article: 'der', genderLabel: 'Masculine [M]' },
  woche: { article: 'die', genderLabel: 'Feminine [F]' },
  jahr: { article: 'das', genderLabel: 'Neuter [N]' },
  park: { article: 'der', genderLabel: 'Masculine [M]' },
  kino: { article: 'das', genderLabel: 'Neuter [N]' },
  supermarkt: { article: 'der', genderLabel: 'Masculine [M]' },
  bahnhof: { article: 'der', genderLabel: 'Masculine [M]' },
  lehrer: { article: 'der', genderLabel: 'Masculine [M]' },
  lehrerin: { article: 'die', genderLabel: 'Feminine [F]' },
  zimmer: { article: 'das', genderLabel: 'Neuter [N]' },
  küche: { article: 'die', genderLabel: 'Feminine [F]' },
  wetter: { article: 'das', genderLabel: 'Neuter [N]' },
  problem: { article: 'das', genderLabel: 'Neuter [N]' },
  deutsch: { article: 'das', genderLabel: 'Neuter [N]' },
  sprache: { article: 'die', genderLabel: 'Feminine [F]' },
  film: { article: 'der', genderLabel: 'Masculine [M]' },
  musik: { article: 'die', genderLabel: 'Feminine [F]' },
  geld: { article: 'das', genderLabel: 'Neuter [N]' },
  brief: { article: 'der', genderLabel: 'Masculine [M]' },
  fenster: { article: 'das', genderLabel: 'Neuter [N]' },
  tür: { article: 'die', genderLabel: 'Feminine [F]' },
  apfel: { article: 'der', genderLabel: 'Masculine [M]' },
  brot: { article: 'das', genderLabel: 'Neuter [N]' },
  mädchen: { article: 'das', genderLabel: 'Neuter [N]' },
  sonne: { article: 'die', genderLabel: 'Feminine [F]' },
  regen: { article: 'der', genderLabel: 'Masculine [M]' },
};

const DATIVE_PREPS = ['mit', 'nach', 'aus', 'zu', 'von', 'bei', 'seit', 'gegenüber'];
const ACCUSATIVE_PREPS = ['für', 'durch', 'ohne', 'gegen', 'um', 'entlang'];
const SUBORDINATE_CONJS = ['weil', 'dass', 'obwohl', 'wenn', 'ob', 'während', 'bevor', 'nachdem'];
const TIME_PLACE_STARTERS = [
  'heute',
  'morgen',
  'gestern',
  'jetzt',
  'manchmal',
  'oft',
  'leider',
  'normalerweise',
  'vielleicht',
  'danach',
  'dort',
  'hier',
];
const SUBJECT_PRONOUNS = ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr'];
const SEIN_PARTICIPLES = [
  'gegangen',
  'gefahren',
  'geflogen',
  'gekommen',
  'geblieben',
  'gewesen',
  'geworden',
  'gelaufen',
  'geschwommen',
  'aufgestanden',
  'eingeschlafen',
  'passiert',
  'gereist',
];

function capitalizeFirst(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * 100% offline rule-based German grammar checker.
 * Works immediately without any API keys.
 */
export function analyzeSentenceLocally(rawInput: string): SentenceAnalysisResult {
  const original = rawInput.trim();
  const issues: SentenceIssue[] = [];
  let corrected = original;

  if (!original) {
    return {
      source: 'local',
      original: '',
      corrected: '',
      issues: [],
    };
  }

  // 1. Check sentence capitalization
  if (/^[a-zäöüß]/.test(original)) {
    const firstWord = original.split(/\s+/)[0];
    issues.push({
      id: 'cap-start',
      severity: 'warning',
      category: 'Capitalization',
      fragment: firstWord,
      suggestion: capitalizeFirst(firstWord),
      rulePill: 'Every German sentence starts with an uppercase letter.',
    });
    corrected = capitalizeFirst(corrected);
  }

  // 2. Check lowercase common nouns
  const words = original.match(/[A-Za-zÄÖÜäöüß]+/g) ?? [];
  const checkedNouns = new Set<string>();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const lower = w.toLowerCase();
    if (
      i > 0 &&
      COMMON_NOUNS[lower] &&
      w === lower &&
      !checkedNouns.has(lower)
    ) {
      checkedNouns.add(lower);
      const cap = capitalizeFirst(w);
      const info = COMMON_NOUNS[lower];
      issues.push({
        id: `noun-cap-${lower}`,
        severity: 'error',
        category: 'Noun Capitalization',
        fragment: w,
        suggestion: cap,
        rulePill: `All German nouns must be capitalized → "${info.article} ${cap}" (${info.genderLabel}).`,
      });
      corrected = corrected.replace(new RegExp(`\\b${w}\\b`, 'g'), cap);
    }
  }

  // 3. Dative prepositions followed by wrong nominative/accusative article
  for (const prep of DATIVE_PREPS) {
    const regex = new RegExp(`\\b(${prep})\\s+(der|den|das|die|ein|eine|einen)\\s+([A-Za-zÄÖÜäöüß]+)`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(corrected)) !== null) {
      const [full, p, art, noun] = match;
      const artLower = art.toLowerCase();
      const nounInfo = COMMON_NOUNS[noun.toLowerCase()];

      if (nounInfo) {
        const expectedDef =
          nounInfo.article === 'die' ? 'der' : 'dem';
        const expectedIndef =
          nounInfo.article === 'die' ? 'einer' : 'einem';

        if (['der', 'den', 'das', 'die'].includes(artLower) && artLower !== expectedDef) {
          const replacement = `${p} ${expectedDef} ${capitalizeFirst(noun)}`;
          issues.push({
            id: `dat-prep-${prep}-${noun}`,
            severity: 'error',
            category: 'Dative Preposition',
            fragment: full,
            suggestion: replacement,
            rulePill: `Preposition "${prep}" always triggers Dative → ${nounInfo.genderLabel} "${nounInfo.article} ${capitalizeFirst(noun)}" becomes "${expectedDef} ${capitalizeFirst(noun)}".`,
          });
          corrected = corrected.replace(full, replacement);
        } else if (['ein', 'eine', 'einen'].includes(artLower)) {
          const replacement = `${p} ${expectedIndef} ${capitalizeFirst(noun)}`;
          issues.push({
            id: `dat-prep-indef-${prep}-${noun}`,
            severity: 'error',
            category: 'Dative Preposition',
            fragment: full,
            suggestion: replacement,
            rulePill: `Preposition "${prep}" always triggers Dative → indefinite article becomes "${expectedIndef}" for ${nounInfo.genderLabel}.`,
          });
          corrected = corrected.replace(full, replacement);
        }
      } else if (artLower === 'das' || artLower === 'den' || artLower === 'einen' || artLower === 'ein') {
        const expected = artLower.startsWith('ein') ? 'einem' : 'dem';
        const replacement = `${p} ${expected} ${noun}`;
        issues.push({
          id: `dat-prep-generic-${prep}-${noun}`,
          severity: 'error',
          category: 'Dative Preposition',
          fragment: full,
          suggestion: replacement,
          rulePill: `Preposition "${prep}" always triggers Dative → Masculine/Neuter articles take "-m" ("${expected}").`,
        });
        corrected = corrected.replace(full, replacement);
      }
    }
  }

  // 4. Accusative prepositions followed by Dative article or nominative masculine
  for (const prep of ACCUSATIVE_PREPS) {
    const regex = new RegExp(`\\b(${prep})\\s+(dem|einem|einer|der|ein)\\s+([A-Za-zÄÖÜäöüß]+)`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(corrected)) !== null) {
      const [full, p, art, noun] = match;
      const artLower = art.toLowerCase();
      const nounInfo = COMMON_NOUNS[noun.toLowerCase()];

      if (artLower === 'dem' || artLower === 'einem' || artLower === 'einer') {
        const fixedArt =
          nounInfo?.article === 'das'
            ? artLower.startsWith('ein')
              ? 'ein'
              : 'das'
            : nounInfo?.article === 'die'
              ? artLower.startsWith('ein')
                ? 'eine'
                : 'die'
              : artLower.startsWith('ein')
                ? 'einen'
                : 'den';
        const replacement = `${p} ${fixedArt} ${capitalizeFirst(noun)}`;
        issues.push({
          id: `akk-prep-${prep}-${noun}`,
          severity: 'error',
          category: 'Accusative Preposition',
          fragment: full,
          suggestion: replacement,
          rulePill: `Preposition "${prep}" always triggers Accusative (never Dative "${artLower}") → use "${fixedArt}".`,
        });
        corrected = corrected.replace(full, replacement);
      } else if (nounInfo?.article === 'der' && (artLower === 'der' || artLower === 'ein')) {
        const fixedArt = artLower === 'der' ? 'den' : 'einen';
        const replacement = `${p} ${fixedArt} ${capitalizeFirst(noun)}`;
        issues.push({
          id: `akk-masc-${prep}-${noun}`,
          severity: 'error',
          category: 'Masculine Accusative',
          fragment: full,
          suggestion: replacement,
          rulePill: `Preposition "${prep}" triggers Accusative → Masculine [M] "${artLower}" changes to "${fixedArt}".`,
        });
        corrected = corrected.replace(full, replacement);
      }
    }
  }

  // 5. V2 Verb-Second Inversion check when sentence begins with a time/place adverb
  const v2Match = corrected.match(
    new RegExp(
      `^(${TIME_PLACE_STARTERS.join('|')})\\s+(${SUBJECT_PRONOUNS.join('|')})\\s+([a-zäöüß]{2,})`,
      'i'
    )
  );
  if (v2Match) {
    const [full, adverb, subject, verb] = v2Match;
    const replacement = `${capitalizeFirst(adverb)} ${verb} ${subject.toLowerCase()}`;
    issues.push({
      id: 'v2-inversion',
      severity: 'error',
      category: 'V2 Word Order (Inversion)',
      fragment: full,
      suggestion: replacement,
      rulePill: `German main clauses obey the V2 Rule: when "${adverb}" occupies Position 1, the finite verb "${verb}" MUST stay in Position 2 before "${subject}".`,
    });
    corrected = corrected.replace(full, replacement);
  }

  // 6. Subordinate clause verb-at-end check (e.g., "weil ich habe keine Zeit")
  const subRegex = new RegExp(
    `\\b(${SUBORDINATE_CONJS.join('|')})\\s+(${SUBJECT_PRONOUNS.join('|')})\\s+(bin|bist|ist|sind|habe|hast|hat|haben|kann|kannst|muss|musst|will|gehe|gehst|geht|fahre|fährst|fährt|komme|kommst|kommt|lerne|lernst|lernt|arbeite|arbeitet|möchte|war|hatte)\\s+([^.,!?]+)`,
    'i'
  );
  const subMatch = corrected.match(subRegex);
  if (subMatch) {
    const [full, conj, subj, verb, rest] = subMatch;
    const cleanRest = rest.trim();
    const replacement = `${conj} ${subj} ${cleanRest} ${verb}`;
    issues.push({
      id: `sub-verb-end-${conj}`,
      severity: 'error',
      category: 'Subordinate Clause Word Order',
      fragment: full,
      suggestion: replacement,
      rulePill: `Conjunction "${conj}" introduces a subordinate clause (Nebensatz) → kick the conjugated verb "${verb}" to the very end of the clause!`,
    });
    corrected = corrected.replace(full, replacement);
  }

  // 7. Perfekt auxiliary check: "haben" with motion/change-of-state participle
  const habenMotionRegex = new RegExp(
    `\\b(habe|hast|hat|haben|habt)\\b([^.,!?]*)\\b(${SEIN_PARTICIPLES.join('|')})\\b`,
    'i'
  );
  const habenMatch = corrected.match(habenMotionRegex);
  if (habenMatch) {
    const [full, aux, middle, participle] = habenMatch;
    const seinMap: Record<string, string> = {
      habe: 'bin',
      hast: 'bist',
      hat: 'ist',
      haben: 'sind',
      habt: 'seid',
    };
    const fixedAux = seinMap[aux.toLowerCase()] ?? 'ist';
    const replacement = `${fixedAux}${middle}${participle}`;
    issues.push({
      id: `perfekt-sein-${participle}`,
      severity: 'error',
      category: 'Perfekt Auxiliary (haben vs. sein)',
      fragment: `${aux} ... ${participle}`,
      suggestion: `${fixedAux} ... ${participle}`,
      rulePill: `Motion & state-change verbs like "${participle}" form the Perfekt with "sein" ("${fixedAux}"), not "haben".`,
    });
    corrected = corrected.replace(full, replacement);
  }

  // 8. Missing comma before subordinate conjunction
  const missingCommaRegex = new RegExp(
    `([a-zäöüß])\\s+(${SUBORDINATE_CONJS.join('|')})\\b`,
    'i'
  );
  const commaMatch = corrected.match(missingCommaRegex);
  if (commaMatch && !corrected.includes(`, ${commaMatch[2]}`)) {
    issues.push({
      id: `comma-${commaMatch[2]}`,
      severity: 'tip',
      category: 'Punctuation',
      fragment: `${commaMatch[1]} ${commaMatch[2]}`,
      suggestion: `${commaMatch[1]}, ${commaMatch[2]}`,
      rulePill: `German always requires a comma before subordinate conjunctions like "${commaMatch[2]}".`,
    });
    corrected = corrected.replace(
      new RegExp(`([A-Za-zÄÖÜäöüß])\\s+(${commaMatch[2]})\\b`),
      '$1, $2'
    );
  }

  // 9. Missing ending punctuation
  if (!/[.!?]$/.test(corrected)) {
    corrected = `${corrected}.`;
  }

  return {
    source: 'local',
    original,
    corrected,
    issues,
    praise:
      issues.length === 0
        ? 'Looks clean under our offline grammar rules! Add an optional Gemini API key in Settings for deep semantic checks and B1/B2 style rewrites.'
        : undefined,
  };
}

/**
 * Optional BYOK Gemini API analysis using the user's own API key from localStorage.
 * Falls back cleanly to local analysis on error.
 */
export async function analyzeSentenceWithGemini(
  sentence: string,
  apiKey: string
): Promise<SentenceAnalysisResult> {
  const prompt = `You are a concise, encouraging German grammar coach ("SatzKlar").
Analyze the learner's German sentence below and return ONLY valid JSON matching this exact shape (no markdown fences):
{
  "corrected": "corrected German sentence",
  "praise": "short 1-sentence positive note if mostly right or encouraging feedback",
  "b1Rewrite": "natural everyday B1 German version",
  "b2Rewrite": "polished idiomatic B2 German version",
  "issues": [
    {
      "id": "unique-id",
      "severity": "error" | "warning" | "tip",
      "category": "short grammar category e.g. Dative Preposition, V2 Word Order",
      "fragment": "exact problematic words from original",
      "suggestion": "corrected replacement",
      "rulePill": "bite-sized explanation of WHY (e.g. Preposition 'mit' triggers Dative -> Masculine 'der' becomes 'dem')"
    }
  ]
}

Learner sentence: "${sentence.replace(/"/g, '\\"')}"`;

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
  const parsed = JSON.parse(cleaned) as Partial<SentenceAnalysisResult>;

  return {
    source: 'gemini',
    original: sentence.trim(),
    corrected: parsed.corrected || sentence.trim(),
    issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    b1Rewrite: parsed.b1Rewrite,
    b2Rewrite: parsed.b2Rewrite,
    praise: parsed.praise,
  };
}
