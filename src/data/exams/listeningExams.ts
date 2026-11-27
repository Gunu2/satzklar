import type { ListeningExam } from '../../types/grammar';

export const LISTENING_EXAMS: ListeningExam[] = [
  // ======================== A1 ========================
  {
    id: 'hoeren-a1-goethe-ansagen',
    cefr: 'A1',
    institute: 'Goethe-Zertifikat',
    partLabel: 'Hören · Teil 1 & 2',
    title: 'Bahnhof, Supermarkt & Arztpraxis',
    scenario:
      'Listen to three typical everyday announcements and short dialogues. Watch out for classic Goethe A1 number, time, and platform traps! (In Exam Mode: 2× listening allowed.)',
    maxPlaysExamMode: 2,
    recommendedMinutes: 6,
    transcript: [
      {
        speaker: 'Durchsage 1 (Bahnhof)',
        voiceRole: 'narrator',
        text: 'Achtung am Gleis vier: Der Regionalexpress nach München fährt heute nicht um vierzehn Uhr fünfzehn, sondern erst um vierzehn Uhr dreißig von Gleis sieben ab. Bitte beachten Sie die Gleisänderung.',
        english:
          'Attention on platform 4: The Regional Express to Munich departs today not at 14:15, but at 14:30 from platform 7. Please note the platform change.',
      },
      {
        speaker: 'Kundin (Bäckerei)',
        voiceRole: 'speakerA',
        text: 'Guten Morgen! Ich hätte gern ein Vollkornbrot und zwei Käsebrötchen. Was kostet das zusammen?',
        english:
          'Good morning! I would like a whole-grain loaf and two cheese rolls. How much is that altogether?',
      },
      {
        speaker: 'Verkäufer',
        voiceRole: 'speakerB',
        text: 'Das Brot kostet drei Euro zwanzig und die Brötchen zusammen zwei Euro vierzig. Das macht fünf Euro sechzig, bitte.',
        english:
          'The bread costs 3.20 euros and the rolls together 2.40 euros. That comes to 5.60 euros, please.',
      },
      {
        speaker: 'Anrufbeantworter (Praxis Dr. Weber)',
        voiceRole: 'narrator',
        text: 'Hier ist die Zahnarztpraxis Doktor Weber. Am Mittwoch bleibt unsere Praxis wegen einer Fortbildung geschlossen. Ab Donnerstag um acht Uhr sind wir wieder für Sie da.',
        english:
          'This is Dr. Weber’s dental practice. On Wednesday our practice remains closed due to training. From Thursday at 8:00 AM we are back for you.',
      },
    ],
    keyVocabulary: [
      { german: 'die Gleisänderung', english: 'platform change' },
      { german: 'nicht ... sondern erst', english: 'not ... but only (trap marker!)' },
      { german: 'die Fortbildung', english: 'professional training' },
      { german: 'geschlossen bleiben', english: 'to remain closed' },
    ],
    questions: [
      {
        id: 'ha1-1-q1',
        format: 'mcq',
        prompt: 'Von welchem Gleis fährt der Zug nach München heute ab?',
        options: ['a) Gleis 4', 'b) Gleis 7', 'c) Gleis 14'],
        correctIndex: 1,
        evidenceQuote: '„... erst um vierzehn Uhr dreißig von Gleis sieben ab.“',
        explanation: 'Classic Goethe trap: Gleis 4 is mentioned first, then corrected to Gleis 7 (Gleisänderung).',
      },
      {
        id: 'ha1-1-q2',
        format: 'mcq',
        prompt: 'Wann fährt der Regionalexpress heute ab?',
        options: ['a) 14:15 Uhr', 'b) 14:30 Uhr', 'c) 15:30 Uhr'],
        correctIndex: 1,
        evidenceQuote: '„... nicht um vierzehn Uhr fünfzehn, sondern erst um vierzehn Uhr dreißig ...“',
        explanation: "'nicht um 14:15, sondern erst um 14:30' cancels the first time and gives 14:30.",
      },
      {
        id: 'ha1-1-q3',
        format: 'mcq',
        prompt: 'Wie viel bezahlt die Kundin in der Bäckerei insgesamt?',
        options: ['a) 3,20 Euro', 'b) 4,60 Euro', 'c) 5,60 Euro'],
        correctIndex: 2,
        evidenceQuote: '„Das macht fünf Euro sechzig, bitte.“',
        explanation: '3,20 € (bread) + 2,40 € (two rolls) = 5,60 € total.',
      },
      {
        id: 'ha1-1-q4',
        format: 'rf',
        prompt: 'Die Zahnarztpraxis Dr. Weber ist am Mittwoch geöffnet.',
        options: ['Richtig', 'Falsch'],
        correctIndex: 1,
        evidenceQuote: '„Am Mittwoch bleibt unsere Praxis wegen einer Fortbildung geschlossen.“',
        explanation: 'Falsch! The practice is closed on Wednesday and reopens Thursday at 8:00.',
      },
    ],
  },
  {
    id: 'hoeren-a1-oesd-telefon',
    cefr: 'A1',
    institute: 'ÖSD',
    partLabel: 'Hören · Aufgabe 2 (Telefon)',
    title: 'Nachricht auf der Mailbox: Treffen am Samstag',
    scenario:
      'Your friend Lukas left a voicemail about Saturday’s plans. Listen carefully for the meeting place, time, and what you should bring.',
    maxPlaysExamMode: 2,
    recommendedMinutes: 5,
    transcript: [
      {
        speaker: 'Lukas (Mailbox)',
        voiceRole: 'speakerB',
        text: 'Hallo! Hier ist Lukas. Ich rufe wegen unserem Treffen am Samstag an.',
        english: 'Hi! This is Lukas. I’m calling about our meetup on Saturday.',
      },
      {
        speaker: 'Lukas (Mailbox)',
        voiceRole: 'speakerB',
        text: 'Das Café am Marktplatz ist leider voll, deshalb treffen wir uns direkt vor dem Kino in der Bahnhofstraße.',
        english:
          'The café at the market square is unfortunately full, so we’ll meet directly in front of the cinema on Bahnhofstraße.',
      },
      {
        speaker: 'Lukas (Mailbox)',
        voiceRole: 'speakerB',
        text: 'Der Film beginnt um neunzehn Uhr, also komm bitte schon um achtzehn Uhr dreißig. Anna kommt auch mit, aber ihr Bruder muss leider arbeiten.',
        english:
          'The movie starts at 7:00 PM, so please come already at 6:30 PM. Anna is coming along too, but her brother unfortunately has to work.',
      },
      {
        speaker: 'Lukas (Mailbox)',
        voiceRole: 'speakerB',
        text: 'Du brauchst kein Geld für die Karten mitzubringen, ich habe sie schon online bezahlt. Ruf mich kurz zurück! Tschüss!',
        english:
          'You don’t need to bring money for the tickets, I already paid for them online. Call me back briefly! Bye!',
      },
    ],
    keyVocabulary: [
      { german: 'die Mailbox', english: 'voicemail' },
      { german: 'deshalb', english: 'therefore / so' },
      { german: 'die Karten (Pl.)', english: 'tickets' },
      { german: 'zurückrufen', english: 'to call back' },
    ],
    questions: [
      {
        id: 'ha1-2-q1',
        format: 'mcq',
        prompt: 'Wo treffen sich die Freunde am Samstag?',
        options: ['a) Im Café am Marktplatz', 'b) Vor dem Kino', 'c) Bei Anna zu Hause'],
        correctIndex: 1,
        evidenceQuote: '„... deshalb treffen wir uns direkt vor dem Kino in der Bahnhofstraße.“',
        explanation: 'The café is full, so they moved the meeting spot in front of the cinema.',
      },
      {
        id: 'ha1-2-q2',
        format: 'mcq',
        prompt: 'Um wie viel Uhr sollen sie sich treffen?',
        options: ['a) Um 18:30 Uhr', 'b) Um 19:00 Uhr', 'c) Um 19:30 Uhr'],
        correctIndex: 0,
        evidenceQuote: '„Der Film beginnt um neunzehn Uhr, also komm bitte schon um achtzehn Uhr dreißig.“',
        explanation: '19:00 is the film start time; the meeting time is 18:30.',
      },
      {
        id: 'ha1-2-q3',
        format: 'rf',
        prompt: 'Annas Bruder kommt auch mit ins Kino.',
        options: ['Richtig', 'Falsch'],
        correctIndex: 1,
        evidenceQuote: '„Anna kommt auch mit, aber ihr Bruder muss leider arbeiten.“',
        explanation: 'Falsch! Anna is coming, but her brother has to work.',
      },
      {
        id: 'ha1-2-q4',
        format: 'rf',
        prompt: 'Lukas hat die Kinokarten bereits gekauft.',
        options: ['Richtig', 'Falsch'],
        correctIndex: 0,
        evidenceQuote: '„... ich habe sie schon online bezahlt.“',
        explanation: 'Richtig! He already paid for the tickets online.',
      },
    ],
  },

  // ======================== A2 ========================
  {
    id: 'hoeren-a2-goethe-radio',
    cefr: 'A2',
    institute: 'Goethe-Zertifikat',
    partLabel: 'Hören · Teil 1 (Radio & Durchsagen)',
    title: 'Wetterbericht, Stadtfest & Sprachkurs',
    scenario:
      'Listen to three A2-level radio messages and public announcements. Choose the single best option (a, b, or c) for each question.',
    maxPlaysExamMode: 2,
    recommendedMinutes: 7,
    transcript: [
      {
        speaker: 'Radiomoderatorin (Wetter)',
        voiceRole: 'speakerA',
        text: 'Und hier das Wochenendwetter für Süddeutschland: Am Samstagvormittag regnet es noch stark bei zwölf Grad. Am Nachmittag kommt aber die Sonne heraus und am Sonntag bleibt es trocken und warm bis zwanzig Grad.',
        english:
          'And here is the weekend weather for southern Germany: Saturday morning it will still rain heavily at 12 degrees. In the afternoon, however, the sun comes out, and Sunday stays dry and warm up to 20 degrees.',
      },
      {
        speaker: 'Veranstaltungstipp',
        voiceRole: 'speakerB',
        text: 'Am Sonntag findet im Stadtpark das jährliche Musikfest statt. Der Eintritt ist für Kinder und Studenten kostenlos; Erwachsene zahlen fünf Euro. Bei schlechtem Wetter ziehen die Konzerte in die Stadthalle um.',
        english:
          'On Sunday the annual music festival takes place in the city park. Admission is free for children and students; adults pay 5 euros. In bad weather the concerts move into the town hall.',
      },
      {
        speaker: 'Sekretariat Volkshochschule',
        voiceRole: 'narrator',
        text: 'Guten Tag, Frau Klein. Hier spricht das Sekretariat der Volkshochschule. Ihr Deutschkurs A2 beginnt nicht in Raum zwölf, sondern im zweiten Stock in Raum zweihundertfünf. Bitte bringen Sie nur ein Heft mit — das Lehrbuch bekommen Sie am ersten Tag von uns.',
        english:
          'Good day, Ms. Klein. This is the adult education center office. Your A2 German course does not start in room 12, but on the second floor in room 205. Please bring only a notebook — you will receive the textbook from us on the first day.',
      },
    ],
    keyVocabulary: [
      { german: 'der Eintritt', english: 'admission / entry fee' },
      { german: 'kostenlos', english: 'free of charge' },
      { german: 'die Volkshochschule (VHS)', english: 'community college / adult education center' },
      { german: 'das Lehrbuch', english: 'textbook' },
    ],
    questions: [
      {
        id: 'ha2-1-q1',
        format: 'mcq',
        prompt: 'Wie wird das Wetter am Sonntag?',
        options: ['a) Regnerisch und kalt', 'b) Trocken und bis 20 Grad warm', 'c) Morgens sonnig, nachmittags Regen'],
        correctIndex: 1,
        evidenceQuote: '„... und am Sonntag bleibt es trocken und warm bis zwanzig Grad.“',
        explanation: 'Saturday morning has rain, whereas Sunday stays dry and warm up to 20°C.',
      },
      {
        id: 'ha2-1-q2',
        format: 'mcq',
        prompt: 'Wer muss beim Musikfest Eintritt bezahlen?',
        options: ['a) Alle Besucher', 'b) Studenten und Kinder', 'c) Nur Erwachsene'],
        correctIndex: 2,
        evidenceQuote: '„Der Eintritt ist für Kinder und Studenten kostenlos; Erwachsene zahlen fünf Euro.“',
        explanation: 'Children and students enter free; adults pay 5 euros.',
      },
      {
        id: 'ha2-1-q3',
        format: 'mcq',
        prompt: 'Wo findet der Deutschkurs A2 statt?',
        options: ['a) In Raum 12', 'b) In Raum 205', 'c) In der Stadthalle'],
        correctIndex: 1,
        evidenceQuote: '„... nicht in Raum zwölf, sondern im zweiten Stock in Raum zweihundertfünf.“',
        explanation: 'Room 12 is negated; the actual room is 205 on the 2nd floor.',
      },
      {
        id: 'ha2-1-q4',
        format: 'mcq',
        prompt: 'Was soll Frau Klein zum ersten Kurstag mitbringen?',
        options: ['a) Nur ein Heft', 'b) Ein Lehrbuch und ein Wörterbuch', 'c) Fünf Euro für Kopien'],
        correctIndex: 0,
        evidenceQuote: '„Bitte bringen Sie nur ein Heft mit — das Lehrbuch bekommen Sie am ersten Tag von uns.“',
        explanation: 'The school provides the textbook; she only needs to bring a notebook (ein Heft).',
      },
    ],
  },
  {
    id: 'hoeren-a2-telc-wohnung',
    cefr: 'A2',
    institute: 'telc',
    partLabel: 'Hören · Teil 2 (Alltagsgespräch)',
    title: 'Gespräch über eine neue Wohnung',
    scenario:
      'Miriam tells her colleague Jan about her new apartment. Listen to their two-person dialogue and decide Richtig / Falsch or pick the best answer.',
    maxPlaysExamMode: 2,
    recommendedMinutes: 6,
    transcript: [
      {
        speaker: 'Jan',
        voiceRole: 'speakerB',
        text: 'Hallo Miriam! Herzlichen Glückwunsch zur neuen Wohnung! Bist du schon ganz eingezogen?',
        english: 'Hi Miriam! Congratulations on the new apartment! Have you completely moved in already?',
      },
      {
        speaker: 'Miriam',
        voiceRole: 'speakerA',
        text: 'Danke, Jan! Fast — die Möbel stehen schon, aber im Wohnzimmer fehlen noch die Lampen und ein paar Kartons muss ich noch auspacken.',
        english:
          'Thanks, Jan! Almost — the furniture is already up, but the lamps are still missing in the living room and I still have to unpack a few boxes.',
      },
      {
        speaker: 'Jan',
        voiceRole: 'speakerB',
        text: 'Und wie ist die Lage? Brauchst du jetzt länger zur Arbeit?',
        english: 'And how is the location? Does it take you longer to get to work now?',
      },
      {
        speaker: 'Miriam',
        voiceRole: 'speakerA',
        text: 'Im Gegenteil! Früher musste ich zweimal umsteigen und war vierzig Minuten unterwegs. Jetzt fahre ich direkt mit der U-Bahn und bin in fünfzehn Minuten im Büro.',
        english:
          'On the contrary! Previously I had to transfer twice and was on the road for 40 minutes. Now I take the subway directly and am at the office in 15 minutes.',
      },
      {
        speaker: 'Jan',
        voiceRole: 'speakerB',
        text: 'Das klingt super! Hast du auch einen Balkon?',
        english: 'That sounds great! Do you also have a balcony?',
      },
      {
        speaker: 'Miriam',
        voiceRole: 'speakerA',
        text: 'Leider nein, die Wohnung liegt im Erdgeschoss. Aber wir haben einen kleinen grünen Innenhof, in dem alle Nachbarn sitzen dürfen.',
        english:
          'Unfortunately no, the apartment is on the ground floor. But we have a small green courtyard where all neighbors are allowed to sit.',
      },
    ],
    keyVocabulary: [
      { german: 'einziehen', english: 'to move in' },
      { german: 'im Gegenteil', english: 'on the contrary' },
      { german: 'umsteigen', english: 'to transfer (transit)' },
      { german: 'das Erdgeschoss', english: 'ground floor' },
      { german: 'der Innenhof', english: 'courtyard' },
    ],
    questions: [
      {
        id: 'ha2-2-q1',
        format: 'rf',
        prompt: 'Miriam ist mit dem Auspacken schon komplett fertig.',
        options: ['Richtig', 'Falsch'],
        correctIndex: 1,
        evidenceQuote: '„... im Wohnzimmer fehlen noch die Lampen und ein paar Kartons muss ich noch auspacken.“',
        explanation: 'Falsch! Lamps are still missing and a few boxes remain unpacked.',
      },
      {
        id: 'ha2-2-q2',
        format: 'mcq',
        prompt: 'Wie lange dauert Miriams Arbeitsweg jetzt?',
        options: ['a) 15 Minuten', 'b) 25 Minuten', 'c) 40 Minuten'],
        correctIndex: 0,
        evidenceQuote: '„Jetzt fahre ich direkt mit der U-Bahn und bin in fünfzehn Minuten im Büro.“',
        explanation: '40 minutes was her OLD commute; her new direct U-Bahn ride takes 15 minutes.',
      },
      {
        id: 'ha2-2-q3',
        format: 'rf',
        prompt: 'Die neue Wohnung hat einen großen Balkon.',
        options: ['Richtig', 'Falsch'],
        correctIndex: 1,
        evidenceQuote: '„Leider nein, die Wohnung liegt im Erdgeschoss.“',
        explanation: 'Falsch! She has no balcony because it is on the ground floor—instead there is a shared courtyard.',
      },
      {
        id: 'ha2-2-q4',
        format: 'mcq',
        prompt: 'Was gefällt Miriam besonders am Haus?',
        options: ['a) Ein privater Parkplatz', 'b) Ein kleiner grüner Innenhof', 'c) Ein Aufzug in den fünften Stock'],
        correctIndex: 1,
        evidenceQuote: '„Aber wir haben einen kleinen grünen Innenhof, in dem alle Nachbarn sitzen dürfen.“',
        explanation: 'All neighbors can sit in the small green courtyard.',
      },
    ],
  },

  // ======================== B1 ========================
  {
    id: 'hoeren-b1-goethe-teil1',
    cefr: 'B1',
    institute: 'Goethe-Zertifikat',
    partLabel: 'Hören · Teil 1 (Kurze Texte)',
    title: 'Museumstour & Fernzug-Durchsage',
    scenario:
      'Authentic Goethe-Zertifikat B1 Teil 1 format: each short clip has BOTH a Richtig/Falsch check AND a detail question (a/b/c). Listen carefully for conditional rules and changes!',
    maxPlaysExamMode: 2,
    recommendedMinutes: 8,
    transcript: [
      {
        speaker: 'Text 1 (Museumsführung)',
        voiceRole: 'speakerA',
        text: 'Liebe Besucherinnen und Besucher, unsere kostenlose Führung durch die Ausstellung „Moderne Fotografie“ beginnt in zehn Minuten im Foyer. Da die Teilnehmerzahl auf zwanzig Personen begrenzt ist, holen Sie sich bitte vorher eine kostenlose Marke an der Kasse. Das Fotografieren ohne Blitz ist in allen Räumen erlaubt.',
        english:
          'Dear visitors, our free tour through the “Modern Photography” exhibition starts in ten minutes in the lobby. Since attendance is limited to 20 people, please pick up a free token at the ticket desk beforehand. Photography without flash is permitted in all rooms.',
      },
      {
        speaker: 'Text 2 (ICE-Durchsage)',
        voiceRole: 'narrator',
        text: 'Verehrte Fahrgäste im ICE fünfhundertachtzehn nach Frankfurt: Wegen einer Baustelle auf der Strecke erreichen wir Frankfurt Hauptbahnhof voraussichtlich mit fünfundzwanzig Minuten Verspätung. Der Anschlusszug nach Basel wartet leider nicht; Ihre nächste Verbindung fährt um siebzehn Uhr zwölf von Gleis neun. Im Bordbistro erhalten Sie heute Kaffee zum halben Preis.',
        english:
          'Esteemed passengers on ICE 518 to Frankfurt: Due to construction on the track we will reach Frankfurt Central Station approximately 25 minutes late. Unfortunately the connecting train to Basel will not wait; your next connection departs at 17:12 from platform 9. In the onboard bistro you receive coffee at half price today.',
      },
    ],
    keyVocabulary: [
      { german: 'begrenzt auf', english: 'limited to' },
      { german: 'voraussichtlich', english: 'expected / approximately' },
      { german: 'der Anschlusszug', english: 'connecting train' },
      { german: 'zum halben Preis', english: 'at half price' },
    ],
    questions: [
      {
        id: 'hb1-1-q1',
        format: 'rf',
        prompt: '[Text 1] Für die Führung durch die Fotoausstellung muss man extra bezahlen.',
        options: ['Richtig', 'Falsch'],
        correctIndex: 1,
        evidenceQuote: '„... unsere kostenlose Führung ... holen Sie sich bitte vorher eine kostenlose Marke ...“',
        explanation: 'Falsch! You need a token at the desk because capacity is capped at 20, but the tour itself is free.',
      },
      {
        id: 'hb1-1-q2',
        format: 'mcq',
        prompt: '[Text 1] Was gilt für das Fotografieren in der Ausstellung?',
        options: [
          'a) Fotografieren ist streng verboten.',
          'b) Man darf fotografieren, aber ohne Blitz.',
          'c) Nur im Foyer darf man Fotos machen.',
        ],
        correctIndex: 1,
        evidenceQuote: '„Das Fotografieren ohne Blitz ist in allen Räumen erlaubt.“',
        explanation: 'Taking photos without flash is allowed in every room.',
      },
      {
        id: 'hb1-1-q3',
        format: 'rf',
        prompt: '[Text 2] Der Anschlusszug nach Basel wartet auf die verspäteten Fahrgäste.',
        options: ['Richtig', 'Falsch'],
        correctIndex: 1,
        evidenceQuote: '„Der Anschlusszug nach Basel wartet leider nicht ...“',
        explanation: 'Falsch! Passengers must take the next connection at 17:12 from platform 9.',
      },
      {
        id: 'hb1-1-q4',
        format: 'mcq',
        prompt: '[Text 2] Warum hat der ICE Verspätung?',
        options: [
          'a) Wegen eines technischen Defekts am Zug',
          'b) Wegen einer Baustelle auf der Strecke',
          'c) Wegen schlechten Wetters in Frankfurt',
        ],
        correctIndex: 1,
        evidenceQuote: '„Wegen einer Baustelle auf der Strecke erreichen wir Frankfurt ... mit fünfundzwanzig Minuten Verspätung.“',
        explanation: 'Construction on the track (eine Baustelle auf der Strecke) caused the 25-minute delay.',
      },
    ],
  },
  {
    id: 'hoeren-b1-oesd-diskussion',
    cefr: 'B1',
    institute: 'ÖSD',
    partLabel: 'Hören · Teil 4 (Radiodiskussion)',
    title: 'Diskussion im Radio: Homeoffice — Freiheit oder Isolation?',
    scenario:
      'Authentic Goethe/ÖSD B1 Teil 4 radio debate: Moderatorin Sandra talks with HR consultant Stefan about working from home. Track who holds which opinion!',
    maxPlaysExamMode: 2,
    recommendedMinutes: 8,
    transcript: [
      {
        speaker: 'Sandra (Moderatorin)',
        voiceRole: 'speakerA',
        text: 'Willkommen bei „Klartext im Radio“! Heute diskutieren wir über Homeoffice. Bei mir im Studio ist Personalberater Stefan Berger. Herr Berger, wollen heute wirklich alle nur noch von zu Hause arbeiten?',
        english:
          'Welcome to “Klartext on Radio”! Today we are discussing working from home. With me in the studio is HR consultant Stefan Berger. Mr. Berger, do people really only want to work from home nowadays?',
      },
      {
        speaker: 'Stefan Berger',
        voiceRole: 'speakerB',
        text: 'Überraschenderweise nein! In unseren Umfragen sagen rund siebzig Prozent der Beschäftigten, dass sie ein hybrides Modell bevorzugen — also zwei bis drei Tage im Büro und den Rest im Homeoffice.',
        english:
          'Surprisingly no! In our surveys around 70 percent of employees say they prefer a hybrid model — meaning two to three days in the office and the rest from home.',
      },
      {
        speaker: 'Sandra (Moderatorin)',
        voiceRole: 'speakerA',
        text: 'Ich selbst arbeite am liebsten konzentriert zu Hause, weil ich mir jeden Tag über eine Stunde Pendelzeit spare. Allerdings fehlt mir manchmal der spontane Austausch an der Kaffeemaschine.',
        english:
          'Personally I prefer working focused at home because I save over an hour of commuting every day. However, I sometimes miss spontaneous chats at the coffee machine.',
      },
      {
        speaker: 'Stefan Berger',
        voiceRole: 'speakerB',
        text: 'Genau das ist der kritische Punkt, besonders für Berufseinsteiger. Wer neu in einer Firma ist, lernt viel schneller, wenn er Kolleginnen und Kollegen direkt fragen kann. Außerdem fällt es vielen schwer, abends wirklich Feierabend zu machen, wenn der Laptop im Wohnzimmer steht.',
        english:
          'That is precisely the critical point, especially for entry-level employees. Anyone new at a company learns much faster when they can ask colleagues directly. Moreover, many find it hard to truly switch off in the evening when the laptop sits in the living room.',
      },
      {
        speaker: 'Sandra (Moderatorin)',
        voiceRole: 'speakerA',
        text: 'Das stimmt wohl — feste Arbeitszeiten und klare Regeln im Team scheinen also wichtiger zu sein als der Arbeitsort selbst.',
        english:
          'That’s probably true — fixed working hours and clear team rules seem more important than the workplace itself.',
      },
    ],
    keyVocabulary: [
      { german: 'die Umfrage', english: 'survey / poll' },
      { german: 'die Pendelzeit', english: 'commute time' },
      { german: 'der Berufseinsteiger', english: 'career starter / new hire' },
      { german: 'Feierabend machen', english: 'to finish work / clock off' },
    ],
    questions: [
      {
        id: 'hb1-2-q1',
        format: 'mcq',
        prompt: 'Was wünschen sich laut Stefan Bergers Umfragen die meisten Beschäftigten?',
        options: [
          'a) Fünf Tage pro Woche im Büro',
          'b) Eine Mischung aus Büro und Homeoffice',
          'c) Vollständig ortsunabhängige Arbeit ohne Büro',
        ],
        correctIndex: 1,
        evidenceQuote: '„... rund siebzig Prozent der Beschäftigten, dass sie ein hybrides Modell bevorzugen ...“',
        explanation: 'About 70% prefer a hybrid model (2–3 days office + rest at home).',
      },
      {
        id: 'hb1-2-q2',
        format: 'mcq',
        prompt: 'Welchen Hauptvorteil nennt Sandra für ihre eigene Arbeit im Homeoffice?',
        options: [
          'a) Sie verdient dort mehr Geld.',
          'b) Sie spart täglich über eine Stunde Arbeitsweg.',
          'c) Sie kann länger schlafen und abends arbeiten.',
        ],
        correctIndex: 1,
        evidenceQuote: '„... weil ich mir jeden Tag über eine Stunde Pendelzeit spare.“',
        explanation: 'She explicitly highlights saving over an hour of daily commuting (Pendelzeit).',
      },
      {
        id: 'hb1-2-q3',
        format: 'rf',
        prompt: 'Laut Herrn Berger profitieren vor allem neue Mitarbeiter vom reinen Homeoffice.',
        options: ['Richtig', 'Falsch'],
        correctIndex: 1,
        evidenceQuote: '„Wer neu in einer Firma ist, lernt viel schneller, wenn er Kolleginnen und Kollegen direkt fragen kann.“',
        explanation: 'Falsch! He argues the opposite: new hires learn much faster in person in the office.',
      },
      {
        id: 'hb1-2-q4',
        format: 'mcq',
        prompt: 'Welches weitere Problem im Homeoffice erwähnt Herr Berger?',
        options: [
          'a) Langsames Internet in ländlichen Regionen',
          'b) Schwierigkeit, abends von der Arbeit abzuschalten',
          'c) Zu hohe Stromkosten im Winter',
        ],
        correctIndex: 1,
        evidenceQuote: '„Außerdem fällt es vielen schwer, abends wirklich Feierabend zu machen, wenn der Laptop im Wohnzimmer steht.“',
        explanation: 'Blurring of work and leisure makes it hard to call it a day (Feierabend machen).',
      },
    ],
  },

  // ======================== B2 ========================
  {
    id: 'hoeren-b2-goethe-alltag',
    cefr: 'B2',
    institute: 'Goethe-Zertifikat',
    partLabel: 'Hören · Teil 1 (1× hören)',
    title: 'Stadtentwicklung & Autofreie Innenstädte',
    scenario:
      'Authentic Goethe-Zertifikat B2 Teil 1 challenge: In Exam Mode you only hear the audio ONCE! Focus on nuanced stance, counterarguments, and indirect phrasing.',
    maxPlaysExamMode: 1,
    recommendedMinutes: 7,
    transcript: [
      {
        speaker: 'Kommentator (Stadtradio)',
        voiceRole: 'narrator',
        text: 'Seit einem halben Jahr ist unsere Altstadt weitgehend autofrei — ein Schritt, der zunächst heftige Proteste vieler Einzelhändler ausgelöst hatte. Sie befürchteten, dass Kunden aus dem Umland ausbleiben würden.',
        english:
          'For half a year our old town has been largely car-free — a step that initially triggered fierce protests from many retailers. They feared customers from surrounding areas would stay away.',
      },
      {
        speaker: 'Kommentator (Stadtradio)',
        voiceRole: 'narrator',
        text: 'Die nun veröffentlichte Zwischenbilanz der Industrie- und Handelskammer zeichnet jedoch ein differenziertes Bild: Während Möbel- und Elektrogeschäfte tatsächlich leichte Umsatzrückgänge verzeichneten, profitierten Cafés, Buchhandlungen und kleine Boutiquen spürbar von der höheren Aufenthaltsqualität.',
        english:
          'The interim report now published by the Chamber of Commerce, however, paints a nuanced picture: while furniture and electronics stores indeed recorded slight revenue drops, cafés, bookstores, and small boutiques noticeably benefited from the higher quality of stay.',
      },
      {
        speaker: 'Kommentator (Stadtradio)',
        voiceRole: 'narrator',
        text: 'Entscheidend für den langfristigen Erfolg bleibt laut Verkehrsplanern allerdings der konsequente Ausbau von Park-and-Ride-Plätzen am Stadtrand sowie dichtere Taktzeiten bei Bussen und Straßenbahnen am späten Abend.',
        english:
          'Decisive for long-term success, according to transport planners, remains the consistent expansion of Park-and-Ride lots on the city outskirts as well as more frequent bus and tram schedules late in the evening.',
      },
    ],
    keyVocabulary: [
      { german: 'die Zwischenbilanz', english: 'interim assessment / report' },
      { german: 'der Umsatzrückgang', english: 'drop in sales / revenue' },
      { german: 'die Aufenthaltsqualität', english: 'pleasantness / quality of public space' },
      { german: 'die Taktzeit', english: 'service frequency / interval' },
    ],
    questions: [
      {
        id: 'hb2-1-q1',
        format: 'rf',
        prompt: 'Alle Geschäfte in der Altstadt haben seit der Umstellung weniger Umsatz gemacht.',
        options: ['Richtig', 'Falsch'],
        correctIndex: 1,
        evidenceQuote: '„... profitierten Cafés, Buchhandlungen und kleine Boutiquen spürbar ...“',
        explanation: 'Falsch! Only furniture/electronics dipped slightly; cafés, bookstores, and boutiques saw clear gains.',
      },
      {
        id: 'hb2-1-q2',
        format: 'mcq',
        prompt: 'Wie reagierten viele Einzelhändler zu Beginn des Projekts?',
        options: [
          'a) Sie unterstützten die Maßnahme sofort einstimmig.',
          'b) Sie protestierten aus Sorge vor sinkenden Kundenzahlen.',
          'c) Sie verlegten ihre Läden sofort an den Stadtrand.',
        ],
        correctIndex: 1,
        evidenceQuote: '„... heftige Proteste vieler Einzelhändler ... Sie befürchteten, dass Kunden aus dem Umland ausbleiben würden.“',
        explanation: 'Many retailers protested strongly out of fear of losing suburban customers.',
      },
      {
        id: 'hb2-1-q3',
        format: 'mcq',
        prompt: 'Was halten Verkehrsplaner für besonders wichtig für die Zukunft?',
        options: [
          'a) Höhere Parkgebühren in Wohngebieten',
          'b) Mehr Park-and-Ride-Plätze und bessere Abendverbindungen',
          'c) Die Rückkehr zu kostenlosen Parkplätzen in der Altstadt',
        ],
        correctIndex: 1,
        evidenceQuote: '„... Ausbau von Park-and-Ride-Plätzen am Stadtrand sowie dichtere Taktzeiten ... am späten Abend.“',
        explanation: 'Expanding Park-and-Ride at the outskirts plus more frequent evening buses/trams.',
      },
      {
        id: 'hb2-1-q4',
        format: 'mcq',
        prompt: 'Welche Haltung nimmt der Sprecher insgesamt ein?',
        options: [
          'a) Er bewertet die Entwicklung ausgewogen mit Chancen und offenen Aufgaben.',
          'b) Er lehnt autofreie Innenstädte grundsätzlich ab.',
          'c) Er behauptet, alle Probleme seien bereits vollständig gelöst.',
        ],
        correctIndex: 0,
        evidenceQuote: '„... zeichnet jedoch ein differenziertes Bild ... Entscheidend ... bleibt allerdings ...“',
        explanation: 'Classic B2 tone question: balanced/nuanced (ausgewogen / differenziert).',
      },
    ],
  },
  {
    id: 'hoeren-b2-telc-ki-interview',
    cefr: 'B2',
    institute: 'telc',
    partLabel: 'Hören · Teil 2 (Experteninterview)',
    title: 'Künstliche Intelligenz im Arbeitsalltag',
    scenario:
      'A journalist interviews workplace researcher Dr. Katja Lindner on how AI tools reshape everyday office work and continuing education.',
    maxPlaysExamMode: 2,
    recommendedMinutes: 8,
    transcript: [
      {
        speaker: 'Interviewer',
        voiceRole: 'speakerB',
        text: 'Frau Doktor Lindner, viele Arbeitnehmer befürchten, dass KI-Werkzeuge ganze Berufsfelder überflüssig machen. Teilen Sie diese Sorge?',
        english:
          'Dr. Lindner, many employees fear that AI tools will make entire professions obsolete. Do you share that concern?',
      },
      {
        speaker: 'Dr. Katja Lindner',
        voiceRole: 'speakerA',
        text: 'In dieser Absolutheit nicht. Unsere Studien zeigen vielmehr, dass nicht ganze Berufe verschwinden, sondern einzelne Routineaufgaben — etwa das Zusammenfassen langer Protokolle oder erste Textentwürfe. Dadurch verschiebt sich der Schwerpunkt stärker auf kritisches Prüfen und persönliche Beratung.',
        english:
          'Not in such absolute terms. Rather, our studies show that entire professions do not disappear, but individual routine tasks do — such as summarizing long minutes or first text drafts. As a result, the focus shifts more toward critical verification and personal advising.',
      },
      {
        speaker: 'Interviewer',
        voiceRole: 'speakerB',
        text: 'Wo sehen Sie derzeit das größte Risiko im betrieblichen Einsatz?',
        english: 'Where do you currently see the biggest risk in corporate use?',
      },
      {
        speaker: 'Dr. Katja Lindner',
        voiceRole: 'speakerA',
        text: 'Vor allem im unkritischen Vertrauen auf automatisch erzeugte Ergebnisse. Wenn Mitarbeitende Fehler in Fakten oder Zahlen nicht mehr selbst erkennen, entstehen schnell teure Fehlentscheidungen. Unternehmen sollten deshalb nicht nur Software kaufen, sondern gezielt in Weiterbildung investieren.',
        english:
          'Above all in uncritical trust in automatically generated outputs. When employees no longer recognize errors in facts or figures themselves, costly bad decisions quickly arise. Companies should therefore not only buy software, but invest systematically in training.',
      },
    ],
    keyVocabulary: [
      { german: 'überflüssig machen', english: 'to render obsolete' },
      { german: 'der Schwerpunkt', english: 'main focus / emphasis' },
      { german: 'die Fehlentscheidung', english: 'poor / wrong decision' },
      { german: 'gezielt investieren', english: 'to invest strategically / specifically' },
    ],
    questions: [
      {
        id: 'hb2-2-q1',
        format: 'mcq',
        prompt: 'Wie verändert KI laut Dr. Lindner die Arbeitswelt hauptsächlich?',
        options: [
          'a) Sie ersetzt fast alle Büroberufe innerhalb weniger Jahre vollständig.',
          'b) Sie übernimmt vor allem Routineaufgaben und verändert Schwerpunkte.',
          'c) Sie hat kaum messbare Auswirkungen auf den Büroalltag.',
        ],
        correctIndex: 1,
        evidenceQuote: '„... dass nicht ganze Berufe verschwinden, sondern einzelne Routineaufgaben ...“',
        explanation: 'Routine tasks are automated while human focus shifts to verification and advising.',
      },
      {
        id: 'hb2-2-q2',
        format: 'mcq',
        prompt: 'Was nennt Dr. Lindner als größtes aktuelles Risiko?',
        options: [
          'a) Zu hohe Lizenzkosten für kleine Betriebe',
          'b) Blindes Vertrauen in ungeprüfte KI-Ergebnisse',
          'c) Mangelndes Interesse jüngerer Beschäftigter',
        ],
        correctIndex: 1,
        evidenceQuote: '„Vor allem im unkritischen Vertrauen auf automatisch erzeugte Ergebnisse.“',
        explanation: 'Uncritical trust without checking factual/numerical errors leads to costly mistakes.',
      },
      {
        id: 'hb2-2-q3',
        format: 'mcq',
        prompt: 'Was empfiehlt Dr. Lindner den Unternehmen?',
        options: [
          'a) KI-Programme vorerst komplett zu verbieten',
          'b) Neben Software auch gezielt Weiterbildung zu finanzieren',
          'c) Nur noch externe Berater einzustellen',
        ],
        correctIndex: 1,
        evidenceQuote: '„Unternehmen sollten deshalb nicht nur Software kaufen, sondern gezielt in Weiterbildung investieren.“',
        explanation: 'Invest in employee training (Weiterbildung), not merely software licenses.',
      },
      {
        id: 'hb2-2-q4',
        format: 'rf',
        prompt: 'Dr. Lindner glaubt, dass kritisches Prüfen in Zukunft unwichtiger wird.',
        options: ['Richtig', 'Falsch'],
        correctIndex: 1,
        evidenceQuote: '„Dadurch verschiebt sich der Schwerpunkt stärker auf kritisches Prüfen und persönliche Beratung.“',
        explanation: 'Falsch! Critical verification becomes MORE important, not less.',
      },
    ],
  },
];
