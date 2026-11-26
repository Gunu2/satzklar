# Contributing to SatzKlar

Thank you for helping make German grammar visual, intuitive, and open-source! Adding new lessons or exercises requires **zero UI code**—just clean JSON files in `src/data/lessons/`.

## 1. Adding a New Grammar Unit

1. Create a file named `<cefr>-<nn>-<slug>.json` in `src/data/lessons/` (for example, `b2-04-konjunktiv-i.json`).
2. Import and add it to the `LESSONS` array in `src/data/index.ts`.
3. Run `npm run build` to ensure zero TypeScript errors.

## 2. Lesson JSON Schema

```json
{
  "id": "a2-04-example-unit",
  "cefr": "A2",
  "order": 13,
  "title": "Human-Readable English Title",
  "germanTitle": "Deutscher Grammatiktitel",
  "subtitle": "One-sentence summary of what the learner will master.",
  "estimatedMinutes": 4,
  "grammarFocus": ["Tag 1", "Tag 2", "Tag 3"],
  "cheatSheet": {
    "summary": "2-sentence visual mental model of the grammar rule.",
    "keyTakeaways": [
      "Clear bullet point 1",
      "Clear bullet point 2"
    ],
    "patterns": [
      {
        "formula": "mit + dem [M/N]",
        "example": "Ich fahre mit dem Bus.",
        "translation": "I go by bus.",
        "gender": "M"
      }
    ],
    "watchOut": "Highlight the #1 trap learners fall into."
  },
  "exercises": []
}
```

### Gender Codes (Always Color + Badge Accessible)
- `"M"` — Masculine (`der`, Royal Blue `#2563EB`)
- `"F"` — Feminine (`die`, Rose Red `#E11D48`)
- `"N"` — Neuter (`das`, Emerald Green `#059669`)
- `"PL"` — Plural (`die [Pl.]`, Amber Gold `#D97706`)

## 3. Supported Exercise Types

Every exercise MUST include:
- `id`: unique string (e.g., `"a2-04-e1"`)
- `cefr`: `"A1" | "A2" | "B1" | "B2"`
- `english`: accurate English translation
- `fullGerman`: complete, natural German sentence (used for `de-DE` audio)
- `ruleTag`: short rule label (2–5 words)
- `rulePill`: bite-sized explanation of **why** the answer works (trigger → case/form)

### A. `case_drill` (Color-Coded Fill-in-the-Blank + Clickable Nouns)
```json
{
  "id": "a2-04-e1",
  "type": "case_drill",
  "cefr": "A2",
  "prompt": "Ich fahre mit ___ Bus.",
  "english": "I go by bus.",
  "fullGerman": "Ich fahre mit dem Bus.",
  "options": ["der", "den", "dem", "das"],
  "correctIndex": 2,
  "nouns": [
    {
      "word": "Bus",
      "baseForm": "der Bus",
      "gender": "M",
      "activeCase": "Dativ",
      "caseTrigger": "Preposition 'mit' ALWAYS triggers Dative"
    }
  ],
  "ruleTag": "Preposition 'mit' + Dative",
  "rulePill": "Preposition 'mit' triggers Dative → Masculine [M] 'der Bus' becomes 'dem Bus'."
}
```

### B. `satzklammer` (Interactive Sentence Bracket Word Tiles)
Valid `field` values: `"vorfeld"`, `"verb2"`, `"mittelfeld"`, `"endklammer"`, `"nebensatz_conj"`.
```json
{
  "id": "a2-04-e2",
  "type": "satzklammer",
  "cefr": "A2",
  "instruction": "Build the modal verb bracket.",
  "english": "I must work tomorrow.",
  "fullGerman": "Ich muss morgen arbeiten.",
  "tokens": [
    { "id": "t1", "text": "Ich", "field": "vorfeld" },
    { "id": "t2", "text": "muss", "field": "verb2" },
    { "id": "t3", "text": "morgen", "field": "mittelfeld" },
    { "id": "t4", "text": "arbeiten.", "field": "endklammer" }
  ],
  "correctOrder": ["Ich", "muss", "morgen", "arbeiten."],
  "ruleTag": "Modal Bracket",
  "rulePill": "Modal verb sits in Position 2; infinitive closes the End Bracket."
}
```

### C. `wechsel_sim` (Two-Way Preposition Simulator)
Include `preposition`, `noun`, `staticExample`, `motionExample`, `targetMode` (`"wo"` or `"wohin"`), `prompt`, `options`, and `correctIndex`.

### D. `spot_fix` (Spot & Fix the Mistake)
Split the flawed sentence into `sentenceTokens`, point `errorTokenIndex` at the single flawed word, and supply 4 `fixOptions` with `correctFixIndex`.

### E. `verb_conjugation` (Verb & Tense Drill)
Include `infinitive`, `tense`, `subject`, `prompt`, `options`, and `correctIndex`.

## 4. Quality Checklist Before Opening a PR

- [ ] Every German noun is properly capitalized and gender-verified.
- [ ] Every exercise includes a clear `rulePill` explaining *why*.
- [ ] `npm run build` succeeds with zero TypeScript errors.
