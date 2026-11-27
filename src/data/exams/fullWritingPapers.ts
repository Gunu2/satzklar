import type { FullWritingPaper } from '../../types/fullExam';

export const FULL_WRITING_PAPERS: FullWritingPaper[] = [
  // ======================== GOETHE / ÖSD ZERTIFIKAT B1 (60 MIN · 3 AUFGABEN · 40 + 40 + 20 = 100 PUNKTE) ========================
  {
    id: 'vollpruefung-b1-schreiben-1',
    cefr: 'B1',
    institute: 'Goethe-Zertifikat',
    badgeColor: '#EA580C',
    title: 'Zertifikat B1 — Modul Schreiben (Komplette Prüfung · 3 Aufgaben)',
    subtitle: 'Exact Goethe / ÖSD 60-minute writing paper: Aufgabe 1 (40 Pts) + Aufgabe 2 mit Online-Gästebuch (40 Pts) + Aufgabe 3 (20 Pts) = 100 Punkte with official A–E Bewertungsbogen.',
    durationMinutes: 60,
    totalPoints: 100,
    passThreshold: 60,
    tasks: [
      {
        id: 'b1-w1-a1',
        partNumber: 1,
        label: 'Aufgabe 1',
        title: 'Persönliche E-Mail: Umzug in eine neue Wohnung',
        recommendedMinutes: 20,
        maxPoints: 40,
        weights: { erfuellung: 10, kohaerenz: 10, wortschatz: 10, strukturen: 10 },
        register: 'informal',
        minWords: 70,
        targetWords: 80,
        situation:
          'Sie sind vor zwei Wochen in eine neue Wohnung umgezogen. Ein guter Freund / Eine gute Freundin konnte Ihnen beim Umzug leider nicht helfen, weil er/sie im Ausland war. Schreiben Sie eine E-Mail (circa 80 Wörter) und beachten Sie alle drei Punkte sowie Anrede, Einleitung und Schluss.',
        leitpunkte: [
          {
            id: 'b1a1-1',
            label: 'Beschreiben Sie: Wie ist Ihre neue Wohnung und die Umgebung?',
            hint: 'Describe rooms, light, balcony, neighborhood, or transit.',
            detectionKeywords: ['wohnung', 'zimmer', 'hell', 'groß', 'balkon', 'küche', 'lage', 'umgebung', 'park', 'ruhig', 'zentrum'],
          },
          {
            id: 'b1a1-2',
            label: 'Begründen Sie: Was gefällt Ihnen an der neuen Wohnung besonders gut und warum?',
            hint: 'Give a concrete reason with "weil" or "denn".',
            detectionKeywords: ['besonders', 'gefallen', 'gefällt', 'weil', 'denn', 'deshalb', 'schönste', 'liebe', 'toll'],
          },
          {
            id: 'b1a1-3',
            label: 'Machen Sie einen Vorschlag für eine gemeinsame Einweihungsfeier / ein Treffen.',
            hint: 'Propose a concrete day/time to visit and celebrate.',
            detectionKeywords: ['treffen', 'einladen', 'feier', 'party', 'samstag', 'sonntag', 'wochenende', 'vorschlag', 'besuchen', 'kommen', 'zeit'],
          },
        ],
        modelAnswer: {
          text: `Liebe Lena,

wie geht es dir? Ich hoffe, du bist gut aus dem Urlaub zurückgekehrt! Ich schreibe dir heute, weil ich endlich in meine neue Wohnung eingezogen bin.

Du kannst dir gar nicht vorstellen, wie schön es hier ist: Die Wohnung hat zwei helle Zimmer, eine große Küche und liegt direkt neben einem ruhigen Park. Besonders gut gefällt mir der sonnige Balkon, weil ich dort morgens entspannt meinen Kaffee trinken kann. Außerdem brauche ich mit der U-Bahn jetzt nur noch zehn Minuten zur Arbeit.

Ich möchte dir natürlich alles zeigen! Deshalb schlage ich vor, dass du am nächsten Samstag um 16 Uhr vorbeikommst — ich koche dann Pasta für uns. Schreib mir bitte kurz, ob du Zeit hast.

Liebe Grüße
Dein Alex`,
          highlightedPhrases: [
            'Ich schreibe dir heute, weil',
            'Du kannst dir gar nicht vorstellen,',
            'Besonders gut gefällt mir ..., weil',
            'Deshalb schlage ich vor, dass',
          ],
          examinerNote:
            'Band A (40/40 Punkte): covers all 3 Sprachfunktionen (beschreiben, begründen, vorschlagen) in logical order with natural B1 connectors.',
        },
      },
      {
        id: 'b1-w1-a2',
        partNumber: 2,
        label: 'Aufgabe 2',
        title: 'Diskussionsbeitrag: „Einkaufen im Internet vs. kleine Läden“',
        recommendedMinutes: 25,
        maxPoints: 40,
        weights: { erfuellung: 10, kohaerenz: 10, wortschatz: 10, strukturen: 10 },
        register: 'semi-formal',
        minWords: 70,
        targetWords: 80,
        situation:
          'Sie haben im Fernsehen eine Diskussionssendung zum Thema „Online-Shopping oder kleine Geschäfte in der Innenstadt?“ gesehen. Im Online-Gästebuch der Sendung lesen Sie den folgenden Beitrag. Schreiben Sie nun Ihre persönliche Meinung zum Thema (circa 80 Wörter).',
        guestbookStimulus: {
          siteUrl: 'www.diskussion-aktuell.de',
          author: 'Markus, 34',
          timestamp: '18.04. · 19:20 Uhr',
          quote:
            'Ich finde es traurig, dass immer mehr kleine Geschäfte in unseren Innenstädten schließen müssen, weil fast alle nur noch online bestellen. Klar ist das Internet bequem und oft billiger. Aber persönliche Beratung und lebendige Einkaufsstraßen kann kein Online-Shop ersetzen!',
        },
        leitpunkte: [
          {
            id: 'b1a2-1',
            label: 'Nehmen Sie Bezug auf das Thema / den Gästebuch-Beitrag und nennen Sie Ihre Meinung.',
            hint: 'Reference Markus or the debate ("Über das Thema ... / Ich bin der Ansicht, dass...").',
            detectionKeywords: ['markus', 'thema', 'meinung', 'ansicht', 'denke', 'finde', 'überzeugt', 'zustimmen', 'stimme'],
          },
          {
            id: 'b1a2-2',
            label: 'Wägen Sie Vorteile und Nachteile ab (Online vs. lokale Läden).',
            hint: 'Compare convenience/prices with local atmosphere, advice, and packaging waste.',
            detectionKeywords: ['vorteil', 'nachteil', 'einerseits', 'andererseits', 'seite', 'beratung', 'bequem', 'preis', 'billig', 'laden', 'geschäft', 'online'],
          },
          {
            id: 'b1a2-3',
            label: 'Berichten Sie kurz aus eigener Erfahrung und ziehen Sie ein Fazit.',
            hint: 'Share how you shop personally and conclude clearly.',
            detectionKeywords: ['erfahrung', 'ich kaufe', 'ich bestelle', 'selbst', 'deshalb', 'fazit', 'abschließend', 'wichtig', 'zusammen'],
          },
        ],
        modelAnswer: {
          text: `Über das Thema Online-Shopping wird heute sehr viel diskutiert. Wie Markus finde ich es schade, wenn immer mehr kleine Läden in der Innenstadt verschwinden.

Auf der einen Seite bestelle ich selbst manchmal Bücher oder Elektronik im Internet, weil es schnell geht und man Preise leicht vergleichen kann. Auf der anderen Seite schätze ich die persönliche Beratung in lokalen Geschäften sehr. Außerdem möchte ich Kleidung und Schuhe lieber direkt anprobieren, statt ständig Pakete zurückzuschicken.

Abschließend bin ich der Ansicht, dass wir bewusst eine gesunde Mischung finden sollten: Wer regelmäßig auch vor Ort einkauft, hält unsere Städte lebendig.`,
          highlightedPhrases: [
            'Über das Thema ... wird heute sehr viel diskutiert.',
            'Auf der einen Seite ... Auf der anderen Seite',
            'Abschließend bin ich der Ansicht, dass',
          ],
          examinerNote:
            'Band A (40/40 Punkte): directly references the Gästebuch post, weighs both sides with B1 Redemittel, includes personal experience, and closes with a clear conclusion.',
        },
      },
      {
        id: 'b1-w1-a3',
        partNumber: 3,
        label: 'Aufgabe 3',
        title: 'Formelle E-Mail: Termin beim Kursleiter absagen',
        recommendedMinutes: 15,
        maxPoints: 20,
        weights: { erfuellung: 4, kohaerenz: 4, wortschatz: 6, strukturen: 6 },
        register: 'formal',
        minWords: 35,
        targetWords: 45,
        situation:
          'Ihr Kursleiter, Herr Schneider, hat Sie für Donnerstag um 15 Uhr zu einer individuellen Lernberatung eingeladen. Zu diesem Termin können Sie aber leider nicht kommen. Schreiben Sie eine höfliche formelle E-Mail (circa 40 Wörter).',
        leitpunkte: [
          {
            id: 'b1a3-1',
            label: 'Entschuldigen Sie sich höflich bei Herrn Schneider (formelle Anrede & Sie).',
            hint: 'Use "Sehr geehrter Herr Schneider," and apologize politely.',
            detectionKeywords: ['schneider', 'leid', 'entschuldig', 'leider', 'ihnen', 'sehr geehrter'],
          },
          {
            id: 'b1a3-2',
            label: 'Erklären Sie kurz, warum Sie am Donnerstag nicht kommen können (und bitten Sie ggf. um einen Ersatztermin).',
            hint: 'Give a realistic reason (doctor, work shift, family) and propose/ask for a new slot.',
            detectionKeywords: ['weil', 'denn', 'grund', 'muss', 'arzt', 'arbeit', 'termin', 'krank', 'verschieben', 'freitag', 'nächste woche', 'ander'],
          },
        ],
        modelAnswer: {
          text: `Sehr geehrter Herr Schneider,

vielen Dank für Ihre Einladung zur Lernberatung am Donnerstag um 15 Uhr. Es tut mir sehr leid, aber ich kann diesen Termin leider nicht wahrnehmen, weil ich kurzfristig einen wichtigen Arzttermin bekommen habe. Wäre es möglich, das Gespräch auf Freitag oder nächste Woche zu verschieben?

Mit freundlichen Grüßen
Alex Weber`,
          highlightedPhrases: [
            'Sehr geehrter Herr Schneider,',
            'Es tut mir sehr leid, aber',
            'Wäre es möglich, ... zu verschieben?',
            'Mit freundlichen Grüßen',
          ],
          examinerNote:
            'Band A (20/20 Punkte): crisp formal register ("Sie/Ihnen"), polite apology, clear reason, and constructive alternative request.',
        },
      },
    ],
    redemittelBank: [
      {
        section: 'Aufgabe 1 · Informelle E-Mail',
        category: 'Anrede & Einleitung',
        phrases: ['Liebe ..., / Lieber ...,', 'Wie geht es dir?', 'Ich schreibe dir heute, weil ...'],
      },
      {
        section: 'Aufgabe 1 · Informelle E-Mail',
        category: 'Beschreiben, Begründen & Vorschlagen',
        phrases: [
          'Du kannst dir nicht vorstellen, wie ...',
          'Das Schönste war, dass ...',
          'Besonders gut gefällt mir ..., weil ...',
          'Deshalb schlage ich vor, dass wir ...',
          'Ich freue mich auf deine Antwort. Liebe Grüße',
        ],
      },
      {
        section: 'Aufgabe 2 · Internet-Beitrag',
        category: 'Einleitung & Meinung',
        phrases: [
          'Über das Thema ... wird viel diskutiert.',
          'Ich bin der Ansicht, dass ...',
          'Meiner Meinung nach muss man ...',
          'Ich möchte der Ansicht zustimmen / widersprechen, dass ...',
        ],
      },
      {
        section: 'Aufgabe 2 · Internet-Beitrag',
        category: 'Abwägen & Schluss',
        phrases: [
          'Auf der einen Seite ..., auf der anderen Seite ...',
          'Außerdem darf man nicht vergessen, dass ...',
          'Aus eigener Erfahrung weiß ich, dass ...',
          'Abschließend möchte ich sagen, dass ...',
        ],
      },
      {
        section: 'Aufgabe 3 · Formelle E-Mail',
        category: 'Höfliche Absage',
        phrases: [
          'Sehr geehrter Herr ... / Sehr geehrte Frau ...,',
          'Es tut mir sehr leid, aber ich kann leider nicht ...',
          'Der Grund dafür ist, dass ...',
          'Wäre es möglich, einen neuen Termin zu vereinbaren?',
          'Mit freundlichen Grüßen',
        ],
      },
    ],
    konnektoren: [
      {
        group: 'Position 0 (Hauptsatz — V2 bleibt)',
        rule: 'Verb stays in Position 2 after the subject',
        words: ['aber', 'denn', 'und', 'sondern', 'oder'],
      },
      {
        group: 'Position 1 (Hauptsatz — Inversion!)',
        rule: 'Verb immediately follows the connector',
        words: ['deshalb', 'deswegen', 'trotzdem', 'außerdem', 'danach'],
      },
      {
        group: 'Nebensatz (Verb ans Ende!)',
        rule: 'Comma required + conjugated verb goes LAST',
        words: ['weil', 'dass', 'obwohl', 'wenn', 'ob', 'damit', 'sodass', 'bevor', 'während'],
      },
    ],
  },

  // ======================== GOETHE-ZERTIFIKAT B2 (75 MIN · 2 TEILE · 60 + 40 = 100 PUNKTE) ========================
  {
    id: 'vollpruefung-b2-schreiben-1',
    cefr: 'B2',
    institute: 'Goethe-Zertifikat',
    badgeColor: '#0D9488',
    title: 'Goethe-Zertifikat B2 — Modul Schreiben (Komplette Prüfung · 2 Teile)',
    subtitle: 'Full 75-minute Goethe B2 writing paper: Teil 1 Forumsbeitrag (~150 Wörter · 60 Pts) + Teil 2 Formelle Nachricht (~100 Wörter · 40 Pts) = 100 Punkte.',
    durationMinutes: 75,
    totalPoints: 100,
    passThreshold: 60,
    tasks: [
      {
        id: 'b2-w1-t1',
        partNumber: 1,
        label: 'Teil 1',
        title: 'Forumsbeitrag: „Autofreie Innenstädte — Fortschritt oder Belastung?“',
        recommendedMinutes: 50,
        maxPoints: 60,
        weights: { erfuellung: 15, kohaerenz: 15, wortschatz: 15, strukturen: 15 },
        register: 'semi-formal',
        minWords: 130,
        targetWords: 160,
        situation:
          'Schreiben Sie einen Forumsbeitrag zum Thema „Autofreie Innenstädte“. Gehen Sie dabei klar und strukturiert auf ALLE vier offiziellen B2-Leitpunkte ein (mindestens 150 Wörter).',
        leitpunkte: [
          {
            id: 'b2t1-1',
            label: 'Äußern Sie Ihre Meinung zu autofreien Innenstädten.',
            hint: 'Introduce the debate and state your nuanced B2 position.',
            detectionKeywords: ['meinung', 'standpunkt', 'ansicht', 'autofrei', 'innenstadt', 'innenstädte', 'überzeugt'],
          },
          {
            id: 'b2t1-2',
            label: 'Nennen Sie Gründe, warum private Autos im Zentrum weit verbreitet sind.',
            hint: 'Explain convenience, poor suburban transit, transporting heavy purchases.',
            detectionKeywords: ['grund', 'gründe', 'bequem', 'umland', 'pendel', 'einkäufe', 'flexibel', 'auto', 'verbreitet'],
          },
          {
            id: 'b2t1-3',
            label: 'Nennen Sie konkrete Alternativen zum privaten Pkw.',
            hint: 'Suggest public transit, cycling lanes, Park-and-Ride, carsharing.',
            detectionKeywords: ['alternative', 'fahrrad', 'bahn', 'bus', 'nahverkehr', 'öpnv', 'carsharing', 'park-and-ride'],
          },
          {
            id: 'b2t1-4',
            label: 'Nennen Sie Vorteile dieser Alternativen (Umwelt, Lebensqualität, Sicherheit).',
            hint: 'Highlight cleaner air, less noise, safer streets, higher quality of stay.',
            detectionKeywords: ['vorteil', 'vorteile', 'umwelt', 'luft', 'lärm', 'lebensqualität', 'sicher', 'klima', 'gesund'],
          },
        ],
        modelAnswer: {
          text: `In zahlreichen europäischen Metropolen wird derzeit heftig darüber diskutiert, ob private Autos aus den Innenstädten verbannt werden sollten. Ich vertrete die Auffassung, dass weitgehend autofreie Zentren ein notwendiger Schritt in Richtung lebenswerter Städte sind — vorausgesetzt, der Übergang wird sozial verträglich gestaltet.

Dass der private Pkw bisher so stark verbreitet ist, hat durchaus nachvollziehbare Gründe: Viele Pendler aus dem Umland sind auf das Auto angewiesen, weil Busse und Bahnen dort oft unregelmäßig fahren. Zudem empfinden zahlreiche Familien das eigene Fahrzeug beim Transport schwerer Einkäufe als deutlich komfortabler.

Dennoch existieren heute überzeugende Alternativen. Neben einem eng getakteten öffentlichen Nahverkehr und sicheren Fahrradwegen gewinnen vor allem Park-and-Ride-Anlagen am Stadtrand sowie flexible Carsharing-Angebote stark an Bedeutung.

Die Vorteile solcher Konzepte liegen klar auf der Hand: Weniger Verkehr bedeutet sauberere Luft, spürbar geringeren Lärm und deutlich mehr Sicherheit für Fußgänger und Kinder. Gleichzeitig steigt die Aufenthaltsqualität für Cafés und den lokalen Einzelhandel. Zusammenfassend lässt sich festhalten, dass mutige Mobilitätskonzepte langfristig allen Stadtbewohnern zugutekommen.`,
          highlightedPhrases: [
            'Ich vertrete die Auffassung, dass',
            'hat durchaus nachvollziehbare Gründe:',
            'Die Vorteile solcher Konzepte liegen klar auf der Hand:',
            'Zusammenfassend lässt sich festhalten, dass',
          ],
          examinerNote:
            'Band A (60/60 Punkte): ~165 words, all 4 mandatory B2 Leitpunkte developed in 4 cohesive paragraphs with nominalizations and varied syntax.',
        },
      },
      {
        id: 'b2-w1-t2',
        partNumber: 2,
        label: 'Teil 2',
        title: 'Formelle Nachricht: Bitte um Wechsel der Praktikumsabteilung',
        recommendedMinutes: 25,
        maxPoints: 40,
        weights: { erfuellung: 10, kohaerenz: 10, wortschatz: 10, strukturen: 10 },
        register: 'formal',
        minWords: 90,
        targetWords: 115,
        situation:
          'Sie machen derzeit ein dreimonatiges Praktikum in einer großen Firma. Bisher arbeiten Sie in der Verwaltung, möchten aber im letzten Monat gern Erfahrungen in der Marketingabteilung sammeln. Schreiben Sie eine höfliche E-Mail an Ihre Betreuerin Frau Dr. Lindner (mindestens 100 Wörter).',
        leitpunkte: [
          {
            id: 'b2t2-1',
            label: 'Bedanken Sie sich für die bisherigen Erfahrungen in der Verwaltung.',
            hint: 'Express genuine appreciation for what you learned so far.',
            detectionKeywords: ['danke', 'bedanke', 'dankbar', 'verwaltung', 'erfahrung', 'gelernt', 'bisher'],
          },
          {
            id: 'b2t2-2',
            label: 'Begründen Sie Ihren Wunsch, im letzten Monat ins Marketing zu wechseln.',
            hint: 'Link it to your studies, career goals, or interest in communication.',
            detectionKeywords: ['marketing', 'wechsel', 'wechseln', 'abteilung', 'studium', 'beruf', 'interesse', 'erweitern'],
          },
          {
            id: 'b2t2-3',
            label: 'Machen Sie einen konkreten Vorschlag für die Übergabe Ihrer aktuellen Aufgaben.',
            hint: 'Offer a smooth handover so the admin team is not left hanging.',
            detectionKeywords: ['übergabe', 'aufgaben', 'abschließen', 'einarbeiten', 'fertig', 'vorbereiten', 'dokument'],
          },
          {
            id: 'b2t2-4',
            label: 'Bitten Sie höflich (Konjunktiv II) um ein kurzes persönliches Gespräch.',
            hint: 'Use "Wäre es möglich..." / "Ich würde mich sehr freuen..."',
            detectionKeywords: ['gespräch', 'sprechen', 'termin', 'wäre', 'könnten', 'würde', 'zeit', 'verständnis'],
          },
        ],
        modelAnswer: {
          text: `Sehr geehrte Frau Dr. Lindner,

zunächst möchte ich mich herzlich für die hervorragende Betreuung und die wertvollen Einblicke bedanken, die ich in den vergangenen zwei Monaten in der Verwaltungsabteilung gewinnen durfte. Die Zusammenarbeit im Team hat mir ausgesprochen gut gefallen.

Da mein Studium seinen Schwerpunkt im Bereich Unternehmenskommunikation hat, möchte ich im letzten Monat meines Praktikums sehr gern zusätzliche Praxiserfahrung in der Marketingabteilung sammeln. Selbstverständlich würde ich zuvor alle meine laufenden Projekte sauber abschließen und eine ausführliche Übergabe für meine Nachfolge vorbereiten.

Wäre es möglich, in dieser Woche kurz persönlich darüber zu sprechen, ob ein solcher Abteilungswechsel realisierbar wäre? Für Ihr Entgegenkommen wäre ich Ihnen sehr dankbar.

Mit freundlichen Grüßen
Samira Hoffmann`,
          highlightedPhrases: [
            'zunächst möchte ich mich herzlich ... bedanken,',
            'Da mein Studium seinen Schwerpunkt ... hat,',
            'Wäre es möglich, ... ob ... realisierbar wäre?',
            'Für Ihr Entgegenkommen wäre ich Ihnen sehr dankbar.',
          ],
          examinerNote:
            'Band A (40/40 Punkte): ~115 words, diplomatic workplace tone, smooth Konjunktiv II requests, and proactive handover proposal.',
        },
      },
    ],
    redemittelBank: [
      {
        section: 'Teil 1 · B2 Forumsbeitrag',
        category: 'Standpunkt & Gründe',
        phrases: [
          'In der heutigen Gesellschaft wird intensiv darüber diskutiert, ob ...',
          'Ich vertrete die Auffassung, dass ...',
          'Ein wesentlicher Grund dafür liegt in ...',
          'Dennoch darf man nicht außer Acht lassen, dass ...',
        ],
      },
      {
        section: 'Teil 1 · B2 Forumsbeitrag',
        category: 'Alternativen & Fazit',
        phrases: [
          'Als überzeugende Alternative bietet sich ... an.',
          'Die Vorteile liegen klar auf der Hand:',
          'Zusammenfassend lässt sich festhalten, dass ...',
        ],
      },
      {
        section: 'Teil 2 · B2 Formelle Nachricht',
        category: 'Höflichkeit & Konjunktiv II',
        phrases: [
          'Sehr geehrte Frau Dr. ..., / Sehr geehrter Herr ...,',
          'Zunächst möchte ich mich herzlich für ... bedanken.',
          'Selbstverständlich würde ich zuvor ...',
          'Wäre es ausnahmsweise möglich, kurz persönlich darüber zu sprechen?',
          'Für Ihr Verständnis wäre ich Ihnen sehr dankbar.',
        ],
      },
    ],
    konnektoren: [
      {
        group: 'B2 Gehobene Hauptsatz-Adverbien (Pos 1)',
        rule: 'Finite verb immediately follows (Inversion)',
        words: ['dennoch', 'allerdings', 'hingegen', 'zudem', 'folglich', 'stattdessen'],
      },
      {
        group: 'B2 Nebensatz-Konnektoren (Verb am Ende)',
        rule: 'Comma required + conjugated verb goes LAST',
        words: ['obgleich', 'während', 'sofern', 'indem', 'sodass', 'wohingegen'],
      },
      {
        group: 'B2 Doppelkonnektoren',
        rule: 'Creates balanced academic rhythm',
        words: ['einerseits ... andererseits', 'sowohl ... als auch', 'weder ... noch', 'zwar ... aber'],
      },
    ],
  },
];
