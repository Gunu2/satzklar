import type { FullListeningPaper } from '../../types/fullExam';

export const FULL_LISTENING_B2: FullListeningPaper = {
  id: 'vollpruefung-b2-hoeren-1',
  cefr: 'B2',
  institute: 'Goethe-Zertifikat',
  badgeColor: '#0D9488',
  title: 'Goethe-Zertifikat B2 — Modul Hören (Modelltest 1)',
  subtitle: 'Full 4-part Goethe B2 exam simulation: 30 items including 1× hören workplace/news clips, expert interview, 3-speaker debate & academic lecture.',
  durationMinutes: 40,
  totalItems: 30,
  passThreshold: 60,
  sections: [
    // ======================== TEIL 1 (Items 1-10 · 1x hören) ========================
    {
      partNumber: 1,
      title: 'Teil 1',
      subtitle: '5 Alltags- & Medientexte · Aufgaben 1–10 · 1× hören',
      instructions:
        'Sie hören fünf Texte. Sie hören jeden Text EINMAL. Zu jedem Text lösen Sie zwei Aufgaben (Richtig/Falsch + a, b oder c).',
      playsAllowed: 1,
      readingPrepSeconds: 30,
      clips: [
        {
          id: 'b2-t1-c1',
          label: 'Text 1 · Betriebsrat-Info (Firmenrad)',
          intro: 'Sie hören eine Durchsage in einem Unternehmen.',
          lines: [
            {
              speaker: 'Personalabteilung',
              voiceRole: 'speakerA',
              text: 'Liebe Kolleginnen und Kollegen, ab kommenden Monat startet unser neues Dienstrad-Programm. Alle unbefristet Beschäftigten können ein Fahrrad oder E-Bike über die Firma leasen, wobei das Unternehmen dreißig Prozent der monatlichen Rate übernimmt. Wer das Rad auch privat nutzen möchte, braucht dafür keine gesonderte Genehmigung; lediglich eine verpflichtende Jahresinspektion muss in einer Partnerwerkstatt durchgeführt werden.',
              english:
                'Dear colleagues, starting next month our new company-bike program launches. All permanent employees can lease a bike or e-bike through the company, with the firm covering 30% of the monthly installment. Anyone wishing to use the bike privately needs no separate approval; only a mandatory annual inspection must be completed at a partner workshop.',
            },
          ],
        },
        {
          id: 'b2-t1-c2',
          label: 'Text 2 · Kulturnachrichten (Bibliothek)',
          intro: 'Sie hören eine Meldung im Kulturradio.',
          lines: [
            {
              speaker: 'Nachrichtensprecher',
              voiceRole: 'narrator',
              text: 'Die Stadtbibliothek Leipzig erweitert ab Herbst ihr Angebot erheblich: Statt lediglich Bücher und Zeitschriften auszuleihen, eröffnet im Erdgeschoss eine sogenannte „Bibliothek der Dinge“. Mit einem regulären Bibliotheksausweis lassen sich künftig Werkzeuge, Musikinstrumente und sogar Nähmaschinen für jeweils zwei Wochen ausleihen — ganz ohne zusätzliche Leihgebühr.',
              english:
                'Leipzig City Library is significantly expanding its offerings from autumn: instead of only lending books and magazines, a so-called “Library of Things” opens on the ground floor. With a regular library card, tools, musical instruments, and even sewing machines can be borrowed for two weeks each — with no extra rental fee.',
            },
          ],
        },
        {
          id: 'b2-t1-c3',
          label: 'Text 3 · Podcast-Tipp (Lebensmittelrettung)',
          intro: 'Sie hören einen Ausschnitt aus einem Verbraucher-Podcast.',
          lines: [
            {
              speaker: 'Podcasterin',
              voiceRole: 'speakerA',
              text: 'Viele Verbraucher werfen Joghurt oder Nudeln sofort in den Müll, sobald das Mindesthaltbarkeitsdatum abgelaufen ist. Dabei handelt es sich rechtlich gesehen keineswegs um ein Verfallsdatum! Es garantiert lediglich, dass Geschmack und Konsistenz bis zu diesem Tag unverändert bleiben. Bei leicht verderblichen Waren wie frischem Hackfleisch hingegen gilt das strenge Verbrauchsdatum, das man tatsächlich genau beachten sollte.',
              english:
                'Many consumers immediately throw yogurt or pasta in the trash once the best-before date passes. Yet legally speaking it is by no means an expiration date! It merely guarantees taste and texture stay unchanged until that day. For highly perishable goods like fresh minced meat, however, the strict use-by date applies, which one really should observe carefully.',
            },
          ],
        },
        {
          id: 'b2-t1-c4',
          label: 'Text 4 · Wissenschaftsmeldung (Nachtzüge)',
          intro: 'Sie hören einen kurzen Bericht im Radio.',
          lines: [
            {
              speaker: 'Reporter',
              voiceRole: 'speakerB',
              text: 'Europäische Nachtzüge erleben seit drei Jahren einen spürbaren Aufschwung, besonders bei jungen Reisenden und Geschäftsleuten auf Strecken zwischen sechshundert und tausend Kilometern. Dennoch kämpfen die Bahngesellschaften weiterhin mit hohen Trassengebühren und veralteten Schlafwagen, weshalb Tickets häufig teurer sind als Kurzstreckenflüge.',
              english:
                'European night trains have seen a noticeable upswing for three years, especially among young travelers and business people on routes between 600 and 1,000 km. Still, rail operators continue to struggle with high track-access fees and aging sleeper cars, making tickets frequently more expensive than short-haul flights.',
            },
          ],
        },
        {
          id: 'b2-t1-c5',
          label: 'Text 5 · Universitätshinweis (Prüfungsamt)',
          intro: 'Sie hören eine Ansage des Prüfungsamts.',
          lines: [
            {
              speaker: 'Prüfungsamt',
              voiceRole: 'narrator',
              text: 'Wichtige Mitteilung für alle Bachelor-Studierenden: Die Anmeldefrist für die Klausuren im Sommersemester endet verbindlich am fünfzehnten Juni um Mitternacht. Eine nachträgliche Anmeldung per E-Mail ist aus technischen Gründen ausgeschlossen. Wer aus Krankheitsgründen von einer Prüfung zurücktreten muss, reicht das ärztliche Attest spätestens innerhalb von drei Werktagen im Online-Portal ein.',
              english:
                'Important notice for all Bachelor students: The registration deadline for summer semester exams ends strictly on June 15 at midnight. Late registration by email is ruled out for technical reasons. Anyone needing to withdraw due to illness must submit the medical certificate in the online portal within three working days at the latest.',
            },
          ],
        },
      ],
      items: [
        {
          number: 1,
          clipId: 'b2-t1-c1',
          format: 'rf',
          prompt: 'Mitarbeitende benötigen eine Extra-Erlaubnis, um das Firmenrad privat zu fahren.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 1,
          evidenceQuote: '„Wer das Rad auch privat nutzen möchte, braucht dafür keine gesonderte Genehmigung ...“',
          explanation: 'Falsch! Private use requires no separate approval.',
        },
        {
          number: 2,
          clipId: 'b2-t1-c1',
          format: 'mcq',
          prompt: 'Welche Bedingung gilt für das Dienstrad-Programm?',
          options: [
            'a) Die Firma übernimmt 100 % der Leasingrate.',
            'b) Eine jährliche Inspektion in einer Partnerwerkstatt ist Pflicht.',
            'c) Auch befristete Praktikanten können sofort teilnehmen.',
          ],
          correctIndex: 1,
          evidenceQuote: '„... lediglich eine verpflichtende Jahresinspektion muss in einer Partnerwerkstatt durchgeführt werden.“',
          explanation: 'The firm pays 30% (not 100%) for permanent staff, and an annual inspection at a partner shop is mandatory.',
        },
        {
          number: 3,
          clipId: 'b2-t1-c2',
          format: 'rf',
          prompt: 'Für das Ausleihen von Werkzeugen verlangt die Stadtbibliothek Leipzig eine Sondergebühr.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 1,
          evidenceQuote: '„... für jeweils zwei Wochen ausleihen — ganz ohne zusätzliche Leihgebühr.“',
          explanation: 'Falsch! A regular library card suffices with zero extra rental fee.',
        },
        {
          number: 4,
          clipId: 'b2-t1-c2',
          format: 'mcq',
          prompt: 'Wie lange darf man Gegenstände aus der „Bibliothek der Dinge“ behalten?',
          options: ['a) Eine Woche', 'b) Zwei Wochen', 'c) Einen Monat'],
          correctIndex: 1,
          evidenceQuote: '„... für jeweils zwei Wochen ausleihen ...“',
          explanation: 'Items can be borrowed for two weeks each.',
        },
        {
          number: 5,
          clipId: 'b2-t1-c3',
          format: 'rf',
          prompt: 'Nach Ablauf des Mindesthaltbarkeitsdatums sind Produkte automatisch gesundheitsschädlich.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 1,
          evidenceQuote: '„Dabei handelt es sich rechtlich gesehen keineswegs um ein Verfallsdatum!“',
          explanation: 'Falsch! Best-before only guarantees unchanged taste/texture; it is not a safety expiry date.',
        },
        {
          number: 6,
          clipId: 'b2-t1-c3',
          format: 'mcq',
          prompt: 'Bei welchem Lebensmittel muss man das angegebene Datum streng einhalten?',
          options: ['a) Bei trockenen Nudeln', 'b) Bei frischem Hackfleisch', 'c) Bei Naturjoghurt'],
          correctIndex: 1,
          evidenceQuote: '„Bei leicht verderblichen Waren wie frischem Hackfleisch hingegen gilt das strenge Verbrauchsdatum ...“',
          explanation: 'Fresh minced meat carries a strict use-by date (Verbrauchsdatum).',
        },
        {
          number: 7,
          clipId: 'b2-t1-c4',
          format: 'rf',
          prompt: 'Die Nachfrage nach Nachtzügen in Europa ist in den letzten Jahren gesunken.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 1,
          evidenceQuote: '„Europäische Nachtzüge erleben seit drei Jahren einen spürbaren Aufschwung ...“',
          explanation: 'Falsch! Night trains have experienced a noticeable upswing for three years.',
        },
        {
          number: 8,
          clipId: 'b2-t1-c4',
          format: 'mcq',
          prompt: 'Warum sind Nachtzugtickets oft teurer als Flüge?',
          options: [
            'a) Wegen hoher Trassengebühren und älterer Wagen',
            'b) Weil es kaum Nachfrage bei jungen Leuten gibt',
            'c) Weil das Gepäck extra berechnet wird',
          ],
          correctIndex: 0,
          evidenceQuote: '„... kämpfen die Bahngesellschaften weiterhin mit hohen Trassengebühren und veralteten Schlafwagen ...“',
          explanation: 'High track fees and outdated sleeper carriages push ticket prices up.',
        },
        {
          number: 9,
          clipId: 'b2-t1-c5',
          format: 'rf',
          prompt: 'Nach dem 15. Juni kann man sich ausnahmsweise noch per E-Mail anmelden.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 1,
          evidenceQuote: '„Eine nachträgliche Anmeldung per E-Mail ist aus technischen Gründen ausgeschlossen.“',
          explanation: 'Falsch! Late email registration is strictly excluded.',
        },
        {
          number: 10,
          clipId: 'b2-t1-c5',
          format: 'mcq',
          prompt: 'Bis wann muss ein ärztliches Attest bei Krankheit eingereicht werden?',
          options: [
            'a) Noch am selben Abend per Post',
            'b) Innerhalb von drei Werktagen im Online-Portal',
            'c) Spätestens eine Woche nach Semesterende',
          ],
          correctIndex: 1,
          evidenceQuote: '„... reicht das ärztliche Attest spätestens innerhalb von drei Werktagen im Online-Portal ein.“',
          explanation: 'Within three working days via the online portal.',
        },
      ],
    },

    // ======================== TEIL 2 (Items 11-16 · 2x hören) ========================
    {
      partNumber: 2,
      title: 'Teil 2',
      subtitle: 'Radiointerview · Aufgaben 11–16 · 2× hören',
      instructions:
        'Sie hören ein Radiointerview mit der Schlafforscherin Dr. Hannah Vogt. Sie hören das Gespräch zweimal. Wählen Sie bei jeder Aufgabe a, b oder c.',
      playsAllowed: 2,
      readingPrepSeconds: 60,
      clips: [
        {
          id: 'b2-t2-c1',
          label: 'Interview · Dr. Hannah Vogt (Schlafforschung)',
          intro: 'Journalist fragt Dr. Hannah Vogt nach gesundem Schlaf und Leistungsfähigkeit.',
          lines: [
            {
              speaker: 'Interviewer',
              voiceRole: 'speakerB',
              text: 'Frau Doktor Vogt, man liest ständig, jeder Erwachsene müsse exakt acht Stunden pro Nacht schlafen. Stimmt diese Faustregel aus Sicht der modernen Forschung überhaupt?',
              english:
                'Dr. Vogt, one constantly reads that every adult must sleep exactly eight hours per night. Is that rule of thumb even accurate from the standpoint of modern research?',
            },
            {
              speaker: 'Dr. Hannah Vogt',
              voiceRole: 'speakerA',
              text: 'Das ist tatsächlich einer der hartnäckigsten Mythen! Der individuelle Schlafbedarf ist genetisch geprägt und liegt bei den meisten Erwachsenen irgendwo zwischen sechseinhalb und neun Stunden. Entscheidend ist nicht die starre Zahl auf der Uhr, sondern ob man tagsüber ohne literweise Kaffee konzentriert und wach bleibt.',
              english:
                'That is actually one of the most persistent myths! Individual sleep need is genetically shaped and lies somewhere between 6.5 and 9 hours for most adults. What matters isn’t the rigid number on the clock, but whether you stay focused and alert during the day without liters of coffee.',
            },
            {
              speaker: 'Interviewer',
              voiceRole: 'speakerB',
              text: 'Viele Berufstätige versuchen, das Schlafdefizit der Woche einfach am Samstag und Sonntag auszuschlafen. Funktioniert das?',
              english: 'Many working people try to simply sleep off the week’s sleep debt on Saturday and Sunday. Does that work?',
            },
            {
              speaker: 'Dr. Hannah Vogt',
              voiceRole: 'speakerA',
              text: 'Nur sehr begrenzt. Ein bis zwei Stunden länger zu schlafen kann akute Müdigkeit lindern, aber wer regelmäßig bis mittags im Bett bleibt, verschiebt seine innere Uhr wie bei einem leichten Jetlag — wir nennen das sozialen Jetlag. Am Montagmorgen fällt das Aufstehen dann erst recht schwer.',
              english:
                'Only to a very limited extent. Sleeping one to two hours longer can ease acute fatigue, but anyone regularly staying in bed until noon shifts their internal clock like mild jet lag — we call that social jet lag. Getting up Monday morning then feels even harder.',
            },
            {
              speaker: 'Interviewer',
              voiceRole: 'speakerB',
              text: 'Was raten Sie Menschen, die abends im Bett liegen und einfach nicht abschalten können?',
              english: 'What do you advise people who lie in bed at night and simply can’t switch off?',
            },
            {
              speaker: 'Dr. Hannah Vogt',
              voiceRole: 'speakerA',
              text: 'Zwei einfache Dinge wirken in unseren Studien erstaunlich zuverlässig: Erstens sollte man belastende Gedanken oder die Aufgabenliste für den nächsten Tag bereits eine Stunde vor dem Schlafengehen handschriftlich notieren. Und zweitens: Wenn man nach zwanzig Minuten noch hellwach liegt, sollte man kurz aufstehen und in einem anderen Raum etwas Ruhiges lesen, statt sich frustriert im Bett hin und her zu wälzen.',
              english:
                'Two simple things work remarkably reliably in our studies: first, write down stressful thoughts or the next day’s to-do list by hand an hour before bedtime. And second: if you are still wide awake after 20 minutes, get up briefly and read something calm in another room rather than tossing and turning frustratedly in bed.',
            },
          ],
        },
      ],
      items: [
        {
          number: 11,
          clipId: 'b2-t2-c1',
          format: 'mcq',
          prompt: 'Wie bewertet Dr. Vogt die Regel „Jeder braucht acht Stunden Schlaf“?',
          options: [
            'a) Sie gilt für fast alle Erwachsenen exakt.',
            'b) Sie ist ein Mythos, weil der Bedarf individuell variiert.',
            'c) Sie gilt nur für Menschen über fünfzig Jahre.',
          ],
          correctIndex: 1,
          evidenceQuote: '„Das ist tatsächlich einer der hartnäckigsten Mythen! Der individuelle Schlafbedarf ist genetisch geprägt ...“',
          explanation: 'Sleep duration is genetically individual (roughly 6.5–9 hours).',
        },
        {
          number: 12,
          clipId: 'b2-t2-c1',
          format: 'mcq',
          prompt: 'Woran erkennt man laut Dr. Vogt am besten, ob man genug schläft?',
          options: [
            'a) An der Schlaf-App auf der Smartwatch',
            'b) Daran, ob man tagsüber ohne viel Kaffee wach und konzentriert ist',
            'c) Daran, ob man morgens ohne Wecker um sechs aufwacht',
          ],
          correctIndex: 1,
          evidenceQuote: '„... ob man tagsüber ohne literweise Kaffee konzentriert und wach bleibt.“',
          explanation: 'Daytime alertness and concentration without heavy caffeine is the real benchmark.',
        },
        {
          number: 13,
          clipId: 'b2-t2-c1',
          format: 'mcq',
          prompt: 'Was passiert laut Dr. Vogt, wenn man am Wochenende regelmäßig bis mittags schläft?',
          options: [
            'a) Das Wochen-Defizit wird vollständig ausgeglichen.',
            'b) Die innere Uhr gerät aus dem Takt („sozialer Jetlag“).',
            'c) Man schläft in der folgenden Woche tiefer.',
          ],
          correctIndex: 1,
          evidenceQuote: '„... verschiebt seine innere Uhr wie bei einem leichten Jetlag — wir nennen das sozialen Jetlag.“',
          explanation: 'Sleeping until noon disrupts the circadian rhythm and makes Monday harder.',
        },
        {
          number: 14,
          clipId: 'b2-t2-c1',
          format: 'mcq',
          prompt: 'Was empfiehlt Dr. Vogt gegen abendliches Grübeln?',
          options: [
            'a) Aufgaben und Sorgen vor dem Schlafen per Hand aufzuschreiben',
            'b) Spät abends noch eine Stunde Sport zu treiben',
            'c) Den Fernseher im Schlafzimmer laufen zu lassen',
          ],
          correctIndex: 0,
          evidenceQuote: '„... belastende Gedanken oder die Aufgabenliste ... handschriftlich notieren.“',
          explanation: 'Writing down worries/tasks by hand an hour before sleep clears the mind.',
        },
        {
          number: 15,
          clipId: 'b2-t2-c1',
          format: 'mcq',
          prompt: 'Was soll man tun, wenn man nach 20 Minuten noch nicht eingeschlafen ist?',
          options: [
            'a) Unbedingt liegen bleiben und die Augen geschlossen halten',
            'b) Kurz aufstehen und in einem anderen Raum etwas Ruhiges lesen',
            'c) Sofort das Handy prüfen, um sich abzulenken',
          ],
          correctIndex: 1,
          evidenceQuote: '„... sollte man kurz aufstehen und in einem anderen Raum etwas Ruhiges lesen ...“',
          explanation: 'Leave bed briefly and read quietly in another room instead of tossing frustratedly.',
        },
        {
          number: 16,
          clipId: 'b2-t2-c1',
          format: 'mcq',
          prompt: 'Wie lange darf man am Wochenende laut Dr. Vogt sinnvoll ausschlafen?',
          options: [
            'a) Maximal ein bis zwei Stunden länger',
            'b) Überhaupt keine Minute länger',
            'c) Mindestens vier Stunden länger',
          ],
          correctIndex: 0,
          evidenceQuote: '„Ein bis zwei Stunden länger zu schlafen kann akute Müdigkeit lindern ...“',
          explanation: 'One to two extra hours can help acute tiredness without causing severe jet lag.',
        },
      ],
    },

    // ======================== TEIL 3 (Items 17-22 · 1x hören · Wer sagt was?) ========================
    {
      partNumber: 3,
      title: 'Teil 3',
      subtitle: 'Gespräch mit 3 Sprechern · Wer sagt was? · Aufgaben 17–22 · 1× hören',
      instructions:
        'Sie hören ein Gespräch zwischen Moderatorin Clara, Miriam und Lukas über das Thema „Großstadt oder Kleinstadt — wo lebt es sich besser?“. Sie hören das Gespräch EINMAL. Ordnen Sie zu: Wer sagt was?',
      playsAllowed: 1,
      readingPrepSeconds: 60,
      speakerColumns: ['Clara', 'Miriam', 'Lukas'],
      clips: [
        {
          id: 'b2-t3-c1',
          label: 'Gespräch · Großstadt vs. Kleinstadt',
          intro: 'Clara moderiert ein Gespräch mit Miriam (lebt in Berlin) und Lukas (zog aufs Land).',
          lines: [
            {
              speaker: 'Clara',
              voiceRole: 'narrator',
              text: 'Hallo zusammen! Immer mehr junge Familien verlassen die teuren Metropolen und ziehen in kleinere Städte. Miriam, du wohnst mitten in Berlin, Lukas ist vor zwei Jahren in eine Kleinstadt in Baden-Württemberg gezogen. Vermisst du gar nichts, Lukas?',
              english:
                'Hello everyone! More and more young families are leaving expensive metropolises and moving to smaller towns. Miriam, you live right in Berlin, Lukas moved to a small town in Baden-Württemberg two years ago. Don’t you miss anything at all, Lukas?',
            },
            {
              speaker: 'Lukas',
              voiceRole: 'speakerB',
              text: 'Ehrlich gesagt nur die späten Öffnungszeiten der Restaurants! Aber dafür zahle ich für eine helle Vierzimmerwohnung mit Garten weniger als früher für ein winziges Einzimmerapartment. Und meine Kinder können sicher allein mit dem Fahrrad zur Schule fahren.',
              english:
                'Honestly only late restaurant hours! In return I pay less for a bright four-room apartment with a garden than I used to for a tiny studio. And my kids can safely bike to school on their own.',
            },
            {
              speaker: 'Miriam',
              voiceRole: 'speakerA',
              text: 'Das klingt traumhaft, aber für mich überwiegt in der Großstadt die kulturelle Vielfalt — ich kann spontan abends ins Theater, zu Lesungen oder in internationale Kinos gehen, ohne ein eigenes Auto zu brauchen. Auf dem Land wäre ich ohne Auto völlig aufgeschmissen.',
              english:
                'That sounds dreamy, but for me cultural diversity outweighs everything in the big city — I can spontaneously go to theater, readings, or international cinemas at night without needing my own car. In the countryside I’d be completely stranded without a car.',
            },
            {
              speaker: 'Clara',
              voiceRole: 'narrator',
              text: 'Stimmt, die Abhängigkeit vom eigenen Auto ist für viele tatsächlich der größte Haken außerhalb der Ballungsräume — besonders, wenn Busse abends nur noch stündlich fahren.',
              english:
                'True, dependence on one’s own car is indeed the biggest catch outside metro areas for many — especially when buses only run hourly in the evening.',
            },
            {
              speaker: 'Lukas',
              voiceRole: 'speakerB',
              text: 'Das war am Anfang wirklich gewöhnungsbedürftig, aber seit ich größtenteils im Homeoffice arbeite, fahre ich nur noch zweimal pro Woche mit dem Zug ins Büro. Außerdem kennt man hier seine Nachbarn beim Namen und hilft sich sofort gegenseitig.',
              english:
                'That really took getting used to at first, but since I mostly work from home, I only take the train to the office twice a week. Plus you know your neighbors by name here and help each other right away.',
            },
            {
              speaker: 'Miriam',
              voiceRole: 'speakerA',
              text: 'Wobei Anonymität in der Großstadt auch angenehm sein kann — nicht jeder möchte, dass die ganze Straße weiß, wann man abends nach Hause kommt! Trotzdem gebe ich zu, dass die explodierenden Mieten langsam selbst für Gutverdiener zum echten Problem werden.',
              english:
                'Although anonymity in the big city can also be pleasant — not everyone wants the whole street to know when you come home at night! Still, I admit skyrocketing rents are slowly becoming a real problem even for high earners.',
            },
          ],
        },
      ],
      items: [
        {
          number: 17,
          clipId: 'b2-t3-c1',
          format: 'speaker_matrix',
          prompt: 'Im ländlichen Raum fehlt vor allem die Möglichkeit, spät abends essen zu gehen.',
          options: ['Clara', 'Miriam', 'Lukas'],
          correctIndex: 2,
          evidenceQuote: 'Lukas: „Ehrlich gesagt nur die späten Öffnungszeiten der Restaurants!“',
          explanation: 'Lukas admits late restaurant hours are the only thing he misses.',
        },
        {
          number: 18,
          clipId: 'b2-t3-c1',
          format: 'speaker_matrix',
          prompt: 'Das vielfältige Kulturangebot ohne eigenes Auto ist das stärkste Argument für die Großstadt.',
          options: ['Clara', 'Miriam', 'Lukas'],
          correctIndex: 1,
          evidenceQuote: 'Miriam: „... überwiegt in der Großstadt die kulturelle Vielfalt ... ohne ein eigenes Auto zu brauchen.“',
          explanation: 'Miriam highlights spontaneous theater/cinema access without owning a car.',
        },
        {
          number: 19,
          clipId: 'b2-t3-c1',
          format: 'speaker_matrix',
          prompt: 'Seltene Busverbindungen am Abend machen viele Landbewohner vom Auto abhängig.',
          options: ['Clara', 'Miriam', 'Lukas'],
          correctIndex: 0,
          evidenceQuote: 'Clara: „... Abhängigkeit vom eigenen Auto ist ... besonders, wenn Busse abends nur noch stündlich fahren.“',
          explanation: 'Clara points out hourly evening buses drive car dependence.',
        },
        {
          number: 20,
          clipId: 'b2-t3-c1',
          format: 'speaker_matrix',
          prompt: 'Durch Homeoffice muss man nur noch selten ins Büro pendeln.',
          options: ['Clara', 'Miriam', 'Lukas'],
          correctIndex: 2,
          evidenceQuote: 'Lukas: „... seit ich größtenteils im Homeoffice arbeite, fahre ich nur noch zweimal pro Woche mit dem Zug ins Büro.“',
          explanation: 'Lukas notes remote work cut his train commute down to twice a week.',
        },
        {
          number: 21,
          clipId: 'b2-t3-c1',
          format: 'speaker_matrix',
          prompt: 'Eine gewisse Anonymität unter Nachbarn kann durchaus ein Vorteil sein.',
          options: ['Clara', 'Miriam', 'Lukas'],
          correctIndex: 1,
          evidenceQuote: 'Miriam: „Wobei Anonymität in der Großstadt auch angenehm sein kann ...“',
          explanation: 'Miriam defends urban privacy compared to everyone knowing your schedule.',
        },
        {
          number: 22,
          clipId: 'b2-t3-c1',
          format: 'speaker_matrix',
          prompt: 'Stark steigende Mietpreise belasten inzwischen selbst Menschen mit gutem Einkommen.',
          options: ['Clara', 'Miriam', 'Lukas'],
          correctIndex: 1,
          evidenceQuote: 'Miriam: „... dass die explodierenden Mieten langsam selbst für Gutverdiener zum echten Problem werden.“',
          explanation: 'Miriam concedes soaring city rents are becoming a serious issue even for higher earners.',
        },
      ],
    },

    // ======================== TEIL 4 (Items 23-30 · 2x hören · Vortrag) ========================
    {
      partNumber: 4,
      title: 'Teil 4',
      subtitle: 'Fachvortrag · Aufgaben 23–30 · 2× hören',
      instructions:
        'Sie hören einen kurzen Fachvortrag über „Grüne Architektur und Schwammstädte“. Sie hören den Vortrag zweimal. Wählen Sie bei jeder Aufgabe a, b oder c.',
      playsAllowed: 2,
      readingPrepSeconds: 60,
      clips: [
        {
          id: 'b2-t4-c1',
          label: 'Fachvortrag · Grüne Architektur & Schwammstädte',
          intro: 'Architektin Prof. Dr. Sabine Roth spricht über klimaresiliente Stadtplanung.',
          lines: [
            {
              speaker: 'Prof. Dr. Sabine Roth',
              voiceRole: 'speakerA',
              text: 'Sehr geehrte Damen und Herren, wenn im Sommer die Temperaturen in europäischen Großstädten tagelang über fünfunddreißig Grad steigen, verwandeln sich dicht bebaute Viertel in regelrechte Hitzeinseln. Asphalt und Beton speichern die Wärme bis tief in die Nacht und verhindern, dass Wohnungen abkühlen.',
              english:
                'Ladies and gentlemen, when summer temperatures in European big cities rise above 35 degrees for days, densely built districts turn into genuine heat islands. Asphalt and concrete store heat deep into the night and prevent apartments from cooling down.',
            },
            {
              speaker: 'Prof. Dr. Sabine Roth',
              voiceRole: 'speakerA',
              text: 'Eine besonders wirksame Gegenmaßnahme ist das Konzept der sogenannten „Schwammstadt“. Anstatt Regenwasser bei Starkregen sofort über unterirdische Kanäle abzuleiten — was immer häufiger zu Überschwemmungen führt — speichern begrünte Dächer, versickerungsfähige Pflastersteine und kleine Wasserbecken das Wasser direkt vor Ort.',
              english:
                'A particularly effective countermeasure is the so-called “sponge city” concept. Instead of immediately draining rainwater during heavy downpours via underground sewers — which increasingly leads to flooding — green roofs, permeable paving stones, and small basins store water directly on site.',
            },
            {
              speaker: 'Prof. Dr. Sabine Roth',
              voiceRole: 'speakerA',
              text: 'In heißen Trockenphasen verdunstet dieses gespeicherte Wasser über Pflanzen und Bäume und kühlt die Umgebungsluft nachweislich um bis zu vier Grad ab. Gleichzeitig verlängern Dachbegrünungen die Lebensdauer von Flachdächern, weil sie das Material vor extremer UV-Strahlung und Hagel schützen.',
              english:
                'During hot dry spells this stored water evaporates via plants and trees and demonstrably cools surrounding air by up to four degrees. At the same time green roofs extend the lifespan of flat roofs because they shield the material from extreme UV radiation and hail.',
            },
            {
              speaker: 'Prof. Dr. Sabine Roth',
              voiceRole: 'speakerA',
              text: 'Warum setzen nicht längst alle Kommunen dieses Prinzip um? Oft scheitert es weniger an fehlender Technik als an den höheren Anfangsinvestitionen und an komplizierten Zuständigkeiten zwischen Stadtplanung, Wasserwerken und privaten Hauseigentümern. Städte wie Kopenhagen und Wien machen jedoch vor, dass sich die Kosten durch vermiedene Hochwasserschäden schon nach wenigen Jahren rechnen.',
              english:
                'Why haven’t all municipalities implemented this principle long ago? Often it fails less due to missing technology than due to higher upfront investments and complicated responsibilities between urban planning, water utilities, and private homeowners. Cities like Copenhagen and Vienna, however, demonstrate that costs pay off within just a few years through avoided flood damage.',
            },
          ],
        },
      ],
      items: [
        {
          number: 23,
          clipId: 'b2-t4-c1',
          format: 'mcq',
          prompt: 'Warum kühlen dicht bebaute Stadtviertel nachts kaum ab?',
          options: [
            'a) Weil zu viele Klimaanlagen laufen',
            'b) Weil Beton und Asphalt die Hitze lange speichern',
            'c) Weil nachts zu viel Verkehr herrscht',
          ],
          correctIndex: 1,
          evidenceQuote: '„Asphalt und Beton speichern die Wärme bis tief in die Nacht ...“',
          explanation: 'Asphalt and concrete retain daytime heat deep into the night.',
        },
        {
          number: 24,
          clipId: 'b2-t4-c1',
          format: 'mcq',
          prompt: 'Was ist das Kernprinzip einer „Schwammstadt“?',
          options: [
            'a) Regenwasser möglichst rasch in Flüsse abzuleiten',
            'b) Regenwasser lokal aufzunehmen und zu speichern',
            'c) Alle Straßen vollständig unter die Erde zu verlegen',
          ],
          correctIndex: 1,
          evidenceQuote: '„... speichern begrünte Dächer, versickerungsfähige Pflastersteine und kleine Wasserbecken das Wasser direkt vor Ort.“',
          explanation: 'Like a sponge, the city absorbs and stores rainwater on site instead of draining it away immediately.',
        },
        {
          number: 25,
          clipId: 'b2-t4-c1',
          format: 'mcq',
          prompt: 'Welches Risiko entsteht, wenn Starkregen sofort in die Kanalisation geleitet wird?',
          options: [
            'a) Es kommt häufiger zu Überschwemmungen.',
            'b) Das Trinkwasser wird verunreinigt.',
            'c) Die Kanäle frieren im Winter ein.',
          ],
          correctIndex: 0,
          evidenceQuote: '„... über unterirdische Kanäle abzuleiten — was immer häufiger zu Überschwemmungen führt ...“',
          explanation: 'Overloaded sewer systems increasingly cause urban flooding.',
        },
        {
          number: 26,
          clipId: 'b2-t4-c1',
          format: 'mcq',
          prompt: 'Um wie viel Grad können verdunstendes Wasser und Pflanzen die Luft abkühlen?',
          options: ['a) Um bis zu 1 Grad', 'b) Um bis zu 4 Grad', 'c) Um bis zu 10 Grad'],
          correctIndex: 1,
          evidenceQuote: '„... kühlt die Umgebungsluft nachweislich um bis zu vier Grad ab.“',
          explanation: 'Evaporation demonstrably cools local air by up to 4°C.',
        },
        {
          number: 27,
          clipId: 'b2-t4-c1',
          format: 'mcq',
          prompt: 'Welchen Zusatznutzen haben begrünte Flachdächer laut Prof. Roth?',
          options: [
            'a) Sie ersetzen Heizungsanlagen vollständig.',
            'b) Sie schützen das Dachmaterial und verlängern dessen Lebensdauer.',
            'c) Sie erzeugen automatisch elektrischen Strom.',
          ],
          correctIndex: 1,
          evidenceQuote: '„... verlängern Dachbegrünungen die Lebensdauer von Flachdächern, weil sie das Material vor extremer UV-Strahlung und Hagel schützen.“',
          explanation: 'Plants shield roof membranes from UV radiation and hail, making them last longer.',
        },
        {
          number: 28,
          clipId: 'b2-t4-c1',
          format: 'mcq',
          prompt: 'Woran scheitert die Umsetzung in vielen Städten bisher am häufigsten?',
          options: [
            'a) An unausgereifter Technik',
            'b) An höheren Anfangskosten und unklaren Zuständigkeiten',
            'c) Am Widerstand der Bevölkerung gegen Parks',
          ],
          correctIndex: 1,
          evidenceQuote: '„Oft scheitert es weniger an fehlender Technik als an den höheren Anfangsinvestitionen und an komplizierten Zuständigkeiten ...“',
          explanation: 'Upfront investment and fragmented responsibilities—not technology—are the main barriers.',
        },
        {
          number: 29,
          clipId: 'b2-t4-c1',
          format: 'mcq',
          prompt: 'Welche europäischen Städte nennt Prof. Roth als erfolgreiche Vorbilder?',
          options: [
            'a) Paris und Rom',
            'b) Kopenhagen und Wien',
            'c) Madrid und Athen',
          ],
          correctIndex: 1,
          evidenceQuote: '„Städte wie Kopenhagen und Wien machen jedoch vor ...“',
          explanation: 'Copenhagen and Vienna are highlighted as successful examples.',
        },
        {
          number: 30,
          clipId: 'b2-t4-c1',
          format: 'mcq',
          prompt: 'Warum lohnen sich die Investitionen langfristig finanziell?',
          options: [
            'a) Durch Eintrittsgelder für Dachgärten',
            'b) Durch vermiedene Schäden bei Hochwasser',
            'c) Durch den Verkauf von Regenwasser an Nachbarstädte',
          ],
          correctIndex: 1,
          evidenceQuote: '„... dass sich die Kosten durch vermiedene Hochwasserschäden schon nach wenigen Jahren rechnen.“',
          explanation: 'Prevented flood damages offset the initial construction costs within a few years.',
        },
      ],
    },
  ],
};
