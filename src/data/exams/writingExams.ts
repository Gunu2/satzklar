import type { WritingExam } from '../../types/grammar';

export const WRITING_EXAMS: WritingExam[] = [
  // ======================== A1 ========================
  {
    id: 'schreiben-a1-goethe-touristeninfo',
    cefr: 'A1',
    institute: 'Goethe-Zertifikat',
    partLabel: 'Schreiben · Teil 2 (Kurze E-Mail)',
    title: 'Anfrage an die Touristeninformation in Dresden',
    register: 'formal',
    situation:
      'Sie möchten im August eine Woche Urlaub in Dresden machen. Schreiben Sie eine kurze formelle E-Mail an die Touristeninformation (ca. 30–40 Wörter).',
    minWords: 28,
    targetWords: 38,
    recommendedMinutes: 15,
    leitpunkte: [
      {
        id: 'lp1',
        label: 'Warum schreiben Sie? (Urlaub in Dresden im August)',
        hint: 'State when and why you are visiting Dresden.',
        detectionKeywords: ['urlaub', 'dresden', 'august', 'besuchen', 'fahren', 'reisen'],
      },
      {
        id: 'lp2',
        label: 'Bitten Sie um Informationen über Hotels und Sehenswürdigkeiten.',
        hint: 'Ask politely for info on hotels, museums, or sights.',
        detectionKeywords: ['hotel', 'hotels', 'informationen', 'infos', 'sehenswürdigkeiten', 'museum', 'zimmer', 'prospekt'],
      },
      {
        id: 'lp3',
        label: 'Fragen Sie nach den Öffnungszeiten oder einer Stadtführung.',
        hint: 'Ask one concrete question (opening hours, city tour, prices).',
        detectionKeywords: ['stadtführung', 'öffnung', 'wann', 'gibt es', 'kostet', 'preis', 'führen'],
      },
    ],
    redemittel: [
      {
        category: 'Anrede (Formal)',
        phrases: ['Sehr geehrte Damen und Herren,'],
      },
      {
        category: 'Inhalt & Bitten',
        phrases: [
          'ich möchte im August Urlaub in Dresden machen.',
          'Könnten Sie mir bitte Informationen über Hotels schicken?',
          'Gibt es im August auch eine Stadtführung?',
        ],
      },
      {
        category: 'Grußformel',
        phrases: ['Vielen Dank im Voraus!', 'Mit freundlichen Grüßen'],
      },
    ],
    modelAnswer: {
      text: `Sehr geehrte Damen und Herren,

ich möchte im August eine Woche Urlaub in Dresden machen. Könnten Sie mir bitte Informationen über günstige Hotels und bekannte Sehenswürdigkeiten schicken? Außerdem möchte ich gern fragen: Gibt es jeden Tag eine Stadtführung und was kostet sie?

Vielen Dank im Voraus!
Mit freundlichen Grüßen
Alex Weber`,
      highlightedPhrases: [
        'Sehr geehrte Damen und Herren,',
        'Könnten Sie mir bitte',
        'Vielen Dank im Voraus!',
        'Mit freundlichen Grüßen',
      ],
      examinerNote:
        'Full 100% Goethe Start Deutsch 1 marks: crisp formal register ("Sie"), all 3 Leitpunkte addressed clearly, proper greeting & closing.',
    },
  },
  {
    id: 'schreiben-a1-oesd-einladung',
    cefr: 'A1',
    institute: 'ÖSD',
    partLabel: 'Schreiben · Aufgabe 2 (Einladung)',
    title: 'Einladung zum Geburtstag',
    register: 'informal',
    situation:
      'Sie haben am nächsten Samstag Geburtstag und möchten eine Party feiern. Schreiben Sie Ihrer Freundin Sofia eine kurze Nachricht (ca. 35 Wörter).',
    minWords: 28,
    targetWords: 40,
    recommendedMinutes: 15,
    leitpunkte: [
      {
        id: 'lp1',
        label: 'Laden Sie Sofia ein (Tag und Uhrzeit nennen).',
        hint: 'Mention Saturday and the start time.',
        detectionKeywords: ['geburtstag', 'party', 'samstag', 'uhr', 'einladen', 'lade'],
      },
      {
        id: 'lp2',
        label: 'Schreiben Sie, wo die Party stattfindet.',
        hint: 'Say where (at home, in the garden, in a café).',
        detectionKeywords: ['bei mir', 'zu hause', 'wohnung', 'garten', 'café', 'restaurant', 'adresse', 'straße'],
      },
      {
        id: 'lp3',
        label: 'Bitten Sie um eine Antwort (ob sie kommen kann).',
        hint: 'Ask her to reply or bring something.',
        detectionKeywords: ['antwort', 'kommen', 'kannst', 'schreib', 'ruf', 'mitbringen', 'sag mir'],
      },
    ],
    redemittel: [
      {
        category: 'Anrede (Informal)',
        phrases: ['Liebe Sofia,', 'Hallo Sofia,'],
      },
      {
        category: 'Einladen',
        phrases: [
          'am Samstag habe ich Geburtstag und möchte dich herzlich einladen.',
          'Die Party beginnt um 19 Uhr bei mir zu Hause.',
          'Kannst du bitte kurz schreiben, ob du kommst?',
        ],
      },
      {
        category: 'Gruß',
        phrases: ['Ich freue mich auf dich!', 'Liebe Grüße'],
      },
    ],
    modelAnswer: {
      text: `Liebe Sofia,

am nächsten Samstag habe ich Geburtstag und mache eine kleine Party. Ich lade dich herzlich ein! Wir beginnen um 19 Uhr bei mir zu Hause im Garten. Es gibt Pizza und Musik. Kannst du mir bis Donnerstag schreiben, ob du kommen kannst?

Liebe Grüße
Dein Sam`,
      highlightedPhrases: [
        'Liebe Sofia,',
        'Ich lade dich herzlich ein!',
        'ob du kommen kannst?',
        'Liebe Grüße',
      ],
      examinerNote:
        'Warm informal "du" register, exact day/time/location, and a clear closing question—ticks every ÖSD A1 rubric box.',
    },
  },

  // ======================== A2 ========================
  {
    id: 'schreiben-a2-goethe-termin',
    cefr: 'A2',
    institute: 'Goethe-Zertifikat',
    partLabel: 'Schreiben · Teil 1 (SMS / Nachricht)',
    title: 'Treffen verschieben (Nachricht an einen Freund)',
    register: 'informal',
    situation:
      'Sie wollten heute Abend mit Ihrem Freund Jonas ins Kino gehen. Leider können Sie nicht rechtzeitig kommen. Schreiben Sie Jonas eine Nachricht (ca. 40–50 Wörter).',
    minWords: 35,
    targetWords: 48,
    recommendedMinutes: 15,
    leitpunkte: [
      {
        id: 'lp1',
        label: 'Entschuldigen Sie sich bei Jonas.',
        hint: 'Apologize warmly (Es tut mir sehr leid...).',
        detectionKeywords: ['leid', 'entschuldig', 'sorry', 'verzeih'],
      },
      {
        id: 'lp2',
        label: 'Erklären Sie den Grund (warum Sie heute nicht können).',
        hint: 'Give a realistic reason using "weil" or "denn".',
        detectionKeywords: ['weil', 'denn', 'arbeiten', 'büro', 'krank', 'zug', 'verspät', 'termin', 'chef', 'muss'],
      },
      {
        id: 'lp3',
        label: 'Machen Sie einen neuen Vorschlag für ein Treffen.',
        hint: 'Propose another day/time (e.g., tomorrow or Friday).',
        detectionKeywords: ['morgen', 'freitag', 'samstag', 'sonntag', 'wochenende', 'vorschlag', 'hast du zeit', 'können wir', 'treffen'],
      },
    ],
    redemittel: [
      {
        category: 'Entschuldigung',
        phrases: ['Hallo Jonas,', 'es tut mir wirklich sehr leid, aber ...'],
      },
      {
        category: 'Grund & Vorschlag',
        phrases: [
          'ich kann heute Abend leider nicht kommen, weil ich länger arbeiten muss.',
          'Können wir das Treffen auf Freitag verschieben?',
          'Hast du am Samstag um 18 Uhr Zeit?',
        ],
      },
      {
        category: 'Abschluss',
        phrases: ['Gib mir bitte kurz Bescheid!', 'Viele Grüße'],
      },
    ],
    modelAnswer: {
      text: `Hallo Jonas,

es tut mir wirklich sehr leid, aber ich kann heute Abend leider nicht mit dir ins Kino gehen. Ich muss unerwartet länger im Büro arbeiten, weil ein Kollege krank geworden ist. Können wir uns stattdessen am Freitag um 19 Uhr treffen? Ich lade dich dann gern auf ein Getränk ein! Gib mir bitte kurz Bescheid.

Viele Grüße
Lina`,
      highlightedPhrases: [
        'es tut mir wirklich sehr leid',
        'weil ein Kollege krank geworden ist',
        'Können wir uns stattdessen',
        'Gib mir bitte kurz Bescheid',
      ],
      examinerNote:
        'Clean A2/B1 bridge: uses a proper "weil" verb-final clause, polite apology, concrete alternative date, and warm informal tone.',
    },
  },
  {
    id: 'schreiben-a2-telc-sprachschule',
    cefr: 'A2',
    institute: 'telc',
    partLabel: 'Schreiben · Teil 2 (Formelle E-Mail)',
    title: 'Anmeldung für einen Intensivkurs Deutsch',
    register: 'formal',
    situation:
      'Sie möchten ab nächstem Monat einen Deutsch-Intensivkurs an einer Sprachschule besuchen. Schreiben Sie eine formelle E-Mail an die Schule (ca. 45–60 Wörter).',
    minWords: 40,
    targetWords: 55,
    recommendedMinutes: 20,
    leitpunkte: [
      {
        id: 'lp1',
        label: 'Stellen Sie sich kurz vor und nennen Sie Ihr aktuelles Niveau.',
        hint: 'Say who you are and which CEFR level you want (A2/B1).',
        detectionKeywords: ['heiße', 'name', 'niveau', 'a2', 'b1', 'intensivkurs', 'deutschkurs', 'lernen'],
      },
      {
        id: 'lp2',
        label: 'Fragen Sie nach den Kurszeiten und den Kosten.',
        hint: 'Ask when classes run and how much the course costs.',
        detectionKeywords: ['kosten', 'preis', 'euro', 'wann', 'uhrzeit', 'zeiten', 'beginnt', 'dauer'],
      },
      {
        id: 'lp3',
        label: 'Fragen Sie, wie Sie sich anmelden können (und ob ein Einstufungstest nötig ist).',
        hint: 'Ask about registration or a placement test.',
        detectionKeywords: ['anmelden', 'anmeldung', 'test', 'einstufung', 'online', 'platz', 'frei'],
      },
    ],
    redemittel: [
      {
        category: 'Formelle Eröffnung',
        phrases: [
          'Sehr geehrte Damen und Herren,',
          'ich interessiere mich für Ihren Deutsch-Intensivkurs.',
        ],
      },
      {
        category: 'Höfliche Fragen',
        phrases: [
          'Ich habe bereits das Niveau A2 und möchte nun B1 erreichen.',
          'Wie viel kostet der Kurs pro Monat und zu welchen Zeiten findet er statt?',
          'Muss ich vor der Anmeldung einen Einstufungstest machen?',
        ],
      },
      {
        category: 'Schluss',
        phrases: [
          'Über eine baldige Antwort würde ich mich sehr freuen.',
          'Mit freundlichen Grüßen',
        ],
      },
    ],
    modelAnswer: {
      text: `Sehr geehrte Damen und Herren,

mein Name ist David Morales und ich interessiere mich sehr für Ihren Deutsch-Intensivkurs ab nächstem Monat. Ich habe bereits das Niveau A2 und möchte mich gezielt auf B1 vorbereiten.

Könnten Sie mir bitte mitteilen, an welchen Tagen der Kurs stattfindet und wie hoch die Kosten sind? Außerdem würde ich gern wissen, ob ich mich online anmelden kann und ob vorher ein Einstufungstest notwendig ist.

Über Ihre Antwort freue ich mich sehr.
Mit freundlichen Grüßen
David Morales`,
      highlightedPhrases: [
        'ich interessiere mich sehr für',
        'Könnten Sie mir bitte mitteilen,',
        'Außerdem würde ich gern wissen, ob',
        'Mit freundlichen Grüßen',
      ],
      examinerNote:
        'Exemplary telc A2/B1 formal email: indirect questions ("ob..."), consistent "Sie" register, and logical paragraph break.',
    },
  },

  // ======================== B1 ========================
  {
    id: 'schreiben-b1-goethe-teil1-email',
    cefr: 'B1',
    institute: 'Goethe-Zertifikat',
    partLabel: 'Schreiben · Teil 1 (Persönliche E-Mail · ~80 Wörter)',
    title: 'Bericht über ein Konzert / Fest & Treffen vorschlagen',
    register: 'informal',
    situation:
      'Sie waren am Wochenende auf einem tollen Open-Air-Konzert (oder Stadtfest). Ihr Freund Felix konnte leider nicht mitkommen. Schreiben Sie Felix eine E-Mail (ca. 80 Wörter).',
    minWords: 70,
    targetWords: 85,
    recommendedMinutes: 20,
    leitpunkte: [
      {
        id: 'lp1',
        label: 'Beschreiben Sie: Wie war das Konzert / Fest?',
        hint: 'Describe the atmosphere, music, weather, or crowd.',
        detectionKeywords: ['konzert', 'fest', 'stimmung', 'musik', 'wetter', 'toll', 'super', 'schön', 'menschen', 'band'],
      },
      {
        id: 'lp2',
        label: 'Begründen Sie: Was hat Ihnen besonders gut gefallen (oder nicht gefallen)?',
        hint: 'Give a concrete reason using "weil", "obwohl", or "deshalb".',
        detectionKeywords: ['gefallen', 'besonders', 'weil', 'obwohl', 'deshalb', 'lieblings', 'highlight', 'schade'],
      },
      {
        id: 'lp3',
        label: 'Machen Sie einen Vorschlag, wann Sie sich treffen und Fotos zeigen können.',
        hint: 'Suggest a concrete day/time to meet and share photos.',
        detectionKeywords: ['treffen', 'fotos', 'bilder', 'nächste woche', 'samstag', 'sonntag', 'café', 'zeit', 'lust'],
      },
    ],
    redemittel: [
      {
        category: 'Einstieg',
        phrases: [
          'Lieber Felix,',
          'schade, dass du am Wochenende nicht mitkommen konntest!',
        ],
      },
      {
        category: 'Beschreiben & Begründen',
        phrases: [
          'Das Konzert war wirklich unvergesslich, weil die Stimmung fantastisch war.',
          'Besonders gut hat mir gefallen, dass ...',
          'Obwohl es kurz geregnet hat, haben alle weitergetanzt.',
        ],
      },
      {
        category: 'Treffen vorschlagen',
        phrases: [
          'Ich habe viele Fotos gemacht und würde sie dir gern zeigen.',
          'Hast du am Sonntag Nachmittag Lust auf einen Kaffee?',
          'Liebe Grüße',
        ],
      },
    ],
    modelAnswer: {
      text: `Lieber Felix,

wie geht es dir? Es war wirklich schade, dass du am Samstag nicht mit zum Open-Air-Konzert kommen konntest! Die Stimmung im Park war einfach fantastisch und mehr als tausend Menschen haben mitgesungen.

Besonders gut hat mir die Hauptband gefallen, weil sie alle unsere Lieblingslieder live gespielt hat. Obwohl es am Anfang kurz geregnet hat, blieb die Atmosphäre super entspannt.

Ich habe viele Fotos und Videos gemacht, die ich dir unbedingt zeigen möchte. Hast du am nächsten Sonntag um 15 Uhr Zeit, damit wir im Café am Fluss darüber plaudern können?

Liebe Grüße
Dein Marco`,
      highlightedPhrases: [
        'Es war wirklich schade, dass',
        'Besonders gut hat mir ... gefallen, weil',
        'Obwohl es am Anfang kurz geregnet hat,',
        'damit wir ... plaudern können',
      ],
      examinerNote:
        'Classic Goethe B1 Teil 1 model (~95 words): mixes Perfekt/Präteritum naturally, uses dass/weil/obwohl/damit subordinate clauses, and covers all 3 Leitpunkte seamlessly.',
    },
  },
  {
    id: 'schreiben-b1-goethe-teil2-meinung',
    cefr: 'B1',
    institute: 'Goethe-Zertifikat',
    partLabel: 'Schreiben · Teil 2 (Meinungsäußerung · ~80 Wörter)',
    title: 'Diskussionsforum: Smartphones im Schulunterricht?',
    register: 'semi-formal',
    situation:
      'In einem Online-Forum lesen Sie einen Beitrag zum Thema „Sollen Smartphones in der Schule verboten werden?“. Schreiben Sie Ihre persönliche Meinung (ca. 80 Wörter).',
    minWords: 70,
    targetWords: 85,
    recommendedMinutes: 25,
    leitpunkte: [
      {
        id: 'lp1',
        label: 'Beziehen Sie klar Stellung (dafür, dagegen oder differenziert).',
        hint: 'State your stance clearly ("Meiner Meinung nach...").',
        detectionKeywords: ['meinung', 'finde', 'glaube', 'denke', 'halte', 'verbot', 'verbieten', 'erlaubt', 'sinnvoll'],
      },
      {
        id: 'lp2',
        label: 'Nennen Sie mindestens ein Argument (Vor- oder Nachteil).',
        hint: 'Explain distraction vs. digital literacy / research.',
        detectionKeywords: ['ablenk', 'konzentr', 'lernen', 'vorteil', 'nachteil', 'internet', 'informationen', 'recherche', 'wichtig', 'problem'],
      },
      {
        id: 'lp3',
        label: 'Berichten Sie kurz aus eigener Erfahrung oder schlagen Sie eine Lösung vor.',
        hint: 'Add a personal example or compromise (e.g., allowed only in breaks or for projects).',
        detectionKeywords: ['erfahrung', 'selbst', 'schule', 'pause', 'regel', 'lösung', 'kompromiss', 'lehrer', 'unterricht'],
      },
    ],
    redemittel: [
      {
        category: 'Meinung äußern',
        phrases: [
          'Das Thema „Smartphones in der Schule“ finde ich sehr aktuell.',
          'Meiner Meinung nach sollte man Smartphones nicht komplett verbieten.',
          'Ich bin der Ansicht, dass ...',
        ],
      },
      {
        category: 'Abwägen (Pro & Contra)',
        phrases: [
          'Einerseits lenken Handys im Unterricht oft ab.',
          'Andererseits können Schüler damit schnell Informationen recherchieren.',
          'Aus eigener Erfahrung weiß ich, dass ...',
        ],
      },
      {
        category: 'Fazit',
        phrases: [
          'Deshalb halte ich klare Regeln für die beste Lösung.',
        ],
      },
    ],
    modelAnswer: {
      text: `Das Thema „Smartphones in der Schule“ finde ich sehr wichtig und aktuell. Meiner Meinung nach sollte man Handys nicht komplett verbieten, sondern klare Regeln einführen.

Einerseits lenken Nachrichten und soziale Medien die Schülerinnen und Schüler während des Unterrichts stark ab. Aus eigener Erfahrung weiß ich, wie schwer es ist, sich zu konzentrieren, wenn das Handy ständig vibriert. Andererseits gehören Smartphones heute zum Alltag und können für Recherchen oder Sprach-Apps sehr nützlich sein.

Deshalb halte ich es für sinnvoll, Handys im Unterricht nur für Lernaufgaben zu erlauben und sie sonst in der Tasche zu lassen.`,
      highlightedPhrases: [
        'Meiner Meinung nach',
        'Einerseits ... Andererseits',
        'Aus eigener Erfahrung weiß ich,',
        'Deshalb halte ich es für sinnvoll,',
      ],
      examinerNote:
        'Band-100 Goethe/ÖSD B1 Teil 2 forum post (~95 words): balanced structure, strong B1 connectors, and personal experience.',
    },
  },

  // ======================== B2 ========================
  {
    id: 'schreiben-b2-goethe-teil1-forum',
    cefr: 'B2',
    institute: 'Goethe-Zertifikat',
    partLabel: 'Schreiben · Teil 1 (Forumsbeitrag · ~150 Wörter)',
    title: 'Stellungnahme: Homeoffice als neuer Standard?',
    register: 'semi-formal',
    situation:
      'Schreiben Sie einen strukturierten Forumsbeitrag zum Thema „Arbeiten im Homeoffice“. Gehen Sie auf ALLE vier offiziellen B2-Leitpunkte ein (mind. 150 Wörter).',
    minWords: 120,
    targetWords: 155,
    recommendedMinutes: 40,
    leitpunkte: [
      {
        id: 'lp1',
        label: 'Äußern Sie Ihre Meinung zum Trend „Homeoffice“.',
        hint: 'Introduce the topic and state your clear B2 position.',
        detectionKeywords: ['meinung', 'ansicht', 'überzeugt', 'homeoffice', 'trend', 'arbeitswelt', 'diskutiert'],
      },
      {
        id: 'lp2',
        label: 'Nennen Sie Gründe, warum Homeoffice so beliebt ist.',
        hint: 'Give reasons (flexibility, no commute, work-life balance).',
        detectionKeywords: ['grund', 'gründe', 'beliebt', 'pendel', 'flexibel', 'flexibilität', 'familie', 'zeit', 'sparen'],
      },
      {
        id: 'lp3',
        label: 'Nennen Sie mögliche Nachteile oder Risiken.',
        hint: 'Discuss isolation, blurred boundaries, or teamwork issues.',
        detectionKeywords: ['nachteil', 'risiko', 'problem', 'isolation', 'einsam', 'kontakt', 'austausch', 'feierabend', 'team'],
      },
      {
        id: 'lp4',
        label: 'Nennen Sie andere Arbeitsmodelle / Alternativen (z. B. Hybrid, Coworking).',
        hint: 'Propose an alternative like hybrid work or coworking spaces.',
        detectionKeywords: ['alternative', 'hybrid', 'modell', 'coworking', 'kombination', 'mischung', 'lösung', 'büro'],
      },
    ],
    redemittel: [
      {
        category: 'Einleitung & Standpunkt',
        phrases: [
          'In der heutigen Arbeitswelt wird das Thema Homeoffice intensiv diskutiert.',
          'Ich vertrete den Standpunkt, dass ...',
        ],
      },
      {
        category: 'Argumentation (B2)',
        phrases: [
          'Ein wesentlicher Grund für die Beliebtheit ist die enorme Zeitersparnis.',
          'Dennoch darf man die Nachteile nicht außer Acht lassen.',
          'Darüber hinaus führt fehlender persönlicher Kontakt häufig zu Isolation.',
        ],
      },
      {
        category: 'Alternativen & Fazit',
        phrases: [
          'Als sinnvolle Alternative bietet sich ein hybrides Arbeitsmodell an.',
          'Zusammenfassend lässt sich sagen, dass Flexibilität und Teamgeist im Gleichgewicht stehen sollten.',
        ],
      },
    ],
    modelAnswer: {
      text: `In der heutigen Arbeitswelt wird kaum ein Thema so intensiv diskutiert wie das Arbeiten im Homeoffice. Ich vertrete den Standpunkt, dass Homeoffice eine wertvolle Errungenschaft ist, solange es nicht vollständig den persönlichen Kontakt ersetzt.

Ein wesentlicher Grund für die große Beliebtheit liegt in der enormen Zeitersparnis: Wer nicht täglich pendeln muss, gewinnt wertvolle Stunden für Familie, Sport oder Erholung. Zudem schätzen viele Beschäftigte die ruhige Arbeitsatmosphäre, in der sich komplexe Aufgaben deutlich konzentrierter erledigen lassen.

Dennoch darf man mögliche Nachteile nicht außer Acht lassen. Wenn Kolleginnen und Kollegen sich monatelang nur über Bildschirme sehen, leidet oft der spontane Ideenaustausch und es entsteht das Gefühl sozialer Isolation. Außerdem verschwimmen zu Hause leicht die Grenzen zwischen Beruf und Privatleben.

Als überzeugende Alternative bietet sich daher ein hybrides Arbeitsmodell oder die Nutzung lokaler Coworking-Spaces an. Zusammenfassend lässt sich sagen, dass eine ausgewogene Kombination aus zwei bis drei Bürotagen und flexiblem Homeoffice sowohl den Unternehmen als auch den Mitarbeitenden am meisten nützt.`,
      highlightedPhrases: [
        'Ich vertrete den Standpunkt, dass',
        'Ein wesentlicher Grund ... liegt in',
        'Dennoch darf man ... nicht außer Acht lassen.',
        'Als überzeugende Alternative bietet sich',
        'Zusammenfassend lässt sich sagen,',
      ],
      examinerNote:
        'Full Goethe B2 Teil 1 model (~165 words): covers all 4 mandatory Leitpunkte in distinct paragraphs, rich nominalizations, passive/reflexive variety, and academic B2 connectors.',
    },
  },
  {
    id: 'schreiben-b2-telc-beschwerde',
    cefr: 'B2',
    institute: 'ÖSD',
    partLabel: 'Schreiben · Teil 2 (Formelle Nachricht · ~120 Wörter)',
    title: 'Bitte um Verschiebung einer Projektfrist an die Projektleitung',
    register: 'formal',
    situation:
      'Sie arbeiten in einem internationalen Team in Wien. Wegen technischer Probleme und Krankheit eines Kollegen können Sie Ihren Projektbericht nicht bis Freitag abgeben. Schreiben Sie eine höfliche formelle E-Mail an Ihre Projektleiterin Frau Dr. Hofer (mind. 100 Wörter).',
    minWords: 95,
    targetWords: 120,
    recommendedMinutes: 25,
    leitpunkte: [
      {
        id: 'lp1',
        label: 'Zeigen Sie Verständnis für die Wichtigkeit der Frist und entschuldigen Sie sich.',
        hint: 'Acknowledge the Friday deadline politely.',
        detectionKeywords: ['verständnis', 'leid', 'entschuldig', 'frist', 'freitag', 'wichtig', 'bewusst'],
      },
      {
        id: 'lp2',
        label: 'Erklären Sie sachlich die Gründe für die Verzögerung.',
        hint: 'Mention technical issues + sick colleague objectively.',
        detectionKeywords: ['wegen', 'aufgrund', 'technisch', 'problem', 'kollege', 'krank', 'verzöger', 'ausfall'],
      },
      {
        id: 'lp3',
        label: 'Bitten Sie höflich (Konjunktiv II) um einen neuen konkreten Abgabetermin.',
        hint: 'Use Konjunktiv II ("Wäre es möglich...", "Ich wäre Ihnen sehr dankbar...").',
        detectionKeywords: ['wäre', 'könnten', 'würde', 'montag', 'dienstag', 'verschieben', 'verlänger', 'termin', 'abgeben'],
      },
      {
        id: 'lp4',
        label: 'Schlagen Sie vor, wie Sie die Qualität oder den Zwischenstand sichern.',
        hint: 'Offer to send a draft/status update on Friday.',
        detectionKeywords: ['zwischenstand', 'entwurf', 'qualität', 'schicken', 'senden', 'zusichern', 'garantier', 'telefon'],
      },
    ],
    redemittel: [
      {
        category: 'Formelle Anrede',
        phrases: ['Sehr geehrte Frau Dr. Hofer,'],
      },
      {
        category: 'Höfliche Bitte (Konjunktiv II)',
        phrases: [
          'Mir ist bewusst, wie wichtig die vereinbarte Frist am Freitag ist.',
          'Aufgrund unerwarteter technischer Probleme und des krankheitsbedingten Ausfalls meines Kollegen ...',
          'Wäre es ausnahmsweise möglich, den Abgabetermin auf Dienstag zu verschieben?',
          'Ich wäre Ihnen für Ihr Verständnis sehr dankbar.',
        ],
      },
      {
        category: 'Lösung & Schluss',
        phrases: [
          'Gern sende ich Ihnen bereits am Freitag einen detaillierten Zwischenstand.',
          'Mit freundlichen Grüßen',
        ],
      },
    ],
    modelAnswer: {
      text: `Sehr geehrte Frau Dr. Hofer,

mir ist vollkommen bewusst, wie wichtig die pünktliche Abgabe unseres Projektberichts am kommenden Freitag ist, weshalb ich mich zunächst für die entstandenen Unannehmlichkeiten entschuldigen möchte.

Aufgrund unerwarteter Serverprobleme sowie des krankheitsbedingten Ausfalls meines Kollegen Lukas konnten wir die abschließende Datenauswertung leider nicht rechtzeitig fertigstellen. Wäre es ausnahmsweise möglich, die Abgabefrist bis kommenden Dienstag um 12 Uhr zu verlängern?

Um Ihnen dennoch volle Transparenz zu bieten, sende ich Ihnen gern bereits am Freitagnachmittag den bisherigen Zwischenstand zu. So können wir sicherstellen, dass der finale Bericht unseren hohen Qualitätsansprüchen entspricht.

Für Ihr Verständnis wäre ich Ihnen sehr dankbar.
Mit freundlichen Grüßen
Nina Bergmann`,
      highlightedPhrases: [
        'Sehr geehrte Frau Dr. Hofer,',
        'Aufgrund unerwarteter Serverprobleme sowie',
        'Wäre es ausnahmsweise möglich,',
        'Für Ihr Verständnis wäre ich Ihnen sehr dankbar.',
      ],
      examinerNote:
        'Top-band Goethe/ÖSD B2 Teil 2 workplace email (~115 words): Genitive prepositions ("Aufgrund"), polite Konjunktiv II ("Wäre es möglich", "wäre ich Ihnen sehr dankbar"), and proactive solution.',
    },
  },
];
