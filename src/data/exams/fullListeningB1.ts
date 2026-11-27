import type { FullListeningPaper } from '../../types/fullExam';

export const FULL_LISTENING_B1: FullListeningPaper = {
  id: 'vollpruefung-b1-hoeren-1',
  cefr: 'B1',
  institute: 'Goethe-Zertifikat',
  badgeColor: '#EA580C',
  title: 'Zertifikat B1 — Modul Hören (Modelltest 1)',
  subtitle: 'Full 4-part Goethe / ÖSD exam simulation: 30 official items, authentic 1×/2× replay limits, live Antwortbogen & transcript evidence.',
  durationMinutes: 40,
  totalItems: 30,
  passThreshold: 60,
  sections: [
    // ======================== TEIL 1 (Items 1-10) ========================
    {
      partNumber: 1,
      title: 'Teil 1',
      subtitle: '5 kurze Texte · Aufgaben 1–10 · 2× hören',
      instructions:
        'Sie hören fünf kurze Texte. Sie hören jeden Text zweimal. Zu jedem Text lösen Sie zwei Aufgaben: eine Richtig/Falsch-Aussage und eine Mehrfachauswahl (a, b oder c).',
      playsAllowed: 2,
      readingPrepSeconds: 30,
      clips: [
        {
          id: 'b1-t1-c1',
          label: 'Text 1 · Anrufbeantworter (Optiker)',
          intro: 'Sie hören eine Nachricht auf dem Anrufbeantworter.',
          lines: [
            {
              speaker: 'Optik Sonnenschein',
              voiceRole: 'speakerA',
              text: 'Guten Tag, Herr Lindner, hier spricht Frau Albrecht von Optik Sonnenschein. Ihre neue Gleitsichtbrille ist schon heute fertig geworden — eigentlich hatten wir ja erst kommenden Montag vereinbart.',
              english:
                'Good day, Mr. Lindner, this is Ms. Albrecht from Optik Sonnenschein. Your new progressive glasses are already ready today — actually we had only agreed on next Monday.',
            },
            {
              speaker: 'Optik Sonnenschein',
              voiceRole: 'speakerA',
              text: 'Sie können sie morgen bis achtzehn Uhr abholen. Da Sie bei der Bestellung bereits alles angezahlt haben, müssen Sie nichts mehr bezahlen. Bitte bringen Sie aber unbedingt Ihren alten Brillenpass mit, damit wir die Werte eintragen können. Vielen Dank!',
              english:
                'You can pick them up tomorrow until 6:00 PM. Since you already paid everything when ordering, you don’t need to pay anything more. However, please definitely bring your old glasses prescription card so we can enter the values. Thank you!',
            },
          ],
        },
        {
          id: 'b1-t1-c2',
          label: 'Text 2 · Anrufbeantworter (Sprachinstitut)',
          intro: 'Sie hören eine Nachricht auf dem Anrufbeantworter.',
          lines: [
            {
              speaker: 'Sprachinstitut Nord',
              voiceRole: 'speakerB',
              text: 'Hallo Frau Kaya, hier ist Martin Wolf vom Sprachinstitut Nord. Es geht um Ihren Abendkurs Englisch für den Beruf, der nächsten Dienstag beginnen sollte.',
              english:
                'Hello Ms. Kaya, this is Martin Wolf from Sprachinstitut Nord. It’s about your evening Business English course that was supposed to start next Tuesday.',
            },
            {
              speaker: 'Sprachinstitut Nord',
              voiceRole: 'speakerB',
              text: 'Leider haben sich für die Dienstagsgruppe nur vier Personen angemeldet, weshalb der Kurs nicht stattfinden kann. Wir bieten Ihnen aber an, ohne Aufpreis in die Donnerstagsgruppe zu wechseln oder die gesamte Kursgebühr zurückzubekommen. Rufen Sie mich bitte bis Freitagmittag zurück!',
              english:
                'Unfortunately only four people registered for the Tuesday group, so the course cannot take place. However, we offer you to switch to the Thursday group at no extra cost or receive the entire course fee back. Please call me back by Friday noon!',
            },
          ],
        },
        {
          id: 'b1-t1-c3',
          label: 'Text 3 · Durchsage im Radio (Verkehrsfunk)',
          intro: 'Sie hören eine Durchsage im Radio.',
          lines: [
            {
              speaker: 'Verkehrsfunk',
              voiceRole: 'narrator',
              text: 'Radio Rhein-Main — der aktuelle Verkehrsservice um halb neun. Auf der Autobahn A3 Richtung Köln stehen Sie zwischen Wiesbaden und Bad Camberg wegen einer Baustelle auf acht Kilometern im Stau.',
              english:
                'Radio Rhein-Main — the latest traffic service at 8:30. On motorway A3 towards Cologne you face an 8-kilometer traffic jam between Wiesbaden and Bad Camberg due to construction.',
            },
            {
              speaker: 'Verkehrsfunk',
              voiceRole: 'narrator',
              text: 'Im Frankfurter Stadtzentrum sind zudem mehrere Straßen rund um den Hauptbahnhof wegen eines Radrennens gesperrt. Wir empfehlen allen Pendlern heute dringend, auf die S-Bahn umzusteigen. Gute Fahrt!',
              english:
                'In Frankfurt city center several streets around the main station are also closed due to a bicycle race. We strongly recommend all commuters today switch to the S-Bahn. Safe travels!',
            },
          ],
        },
        {
          id: 'b1-t1-c4',
          label: 'Text 4 · Durchsage am Hauptbahnhof',
          intro: 'Sie hören eine Durchsage am Hauptbahnhof.',
          lines: [
            {
              speaker: 'Bahnhofsdurchsage',
              voiceRole: 'narrator',
              text: 'Achtung, eine wichtige Information für die Reisenden nach Salzburg: Der Eurocity zweihundertsechzehn mit planmäßiger Abfahrt um zehn Uhr zwanzig fällt heute wegen eines technischen Defekts aus.',
              english:
                'Attention, an important announcement for passengers to Salzburg: Eurocity 216 with scheduled departure at 10:20 is canceled today due to a technical defect.',
            },
            {
              speaker: 'Bahnhofsdurchsage',
              voiceRole: 'narrator',
              text: 'Ihre nächste Reisemöglichkeit nach Salzburg ist der Regionalexpress um zehn Uhr fünfzig von Gleis sechs — bitte beachten Sie, dass dieser Zug keinen Speisewagen führt. Reisende nach Innsbruck benutzen bitte unverändert Gleis neun.',
              english:
                'Your next travel option to Salzburg is the Regional Express at 10:50 from platform 6 — please note that this train has no dining car. Passengers to Innsbruck please use platform 9 unchanged.',
            },
          ],
        },
        {
          id: 'b1-t1-c5',
          label: 'Text 5 · Wetterbericht im Radio',
          intro: 'Sie hören den Wetterbericht im Radio.',
          lines: [
            {
              speaker: 'Wetterredaktion',
              voiceRole: 'speakerA',
              text: 'Und nun die Aussichten für das kommende Wochenende: Während es im Norden Deutschlands am Samstag noch freundlich und trocken bei rund achtzehn Grad bleibt, ziehen am Nachmittag über die Alpen kräftige Gewitter mit starkem Wind auf.',
              english:
                'And now the outlook for the coming weekend: While northern Germany remains pleasant and dry at around 18 degrees on Saturday, strong thunderstorms with heavy winds move in over the Alps in the afternoon.',
            },
            {
              speaker: 'Wetterredaktion',
              voiceRole: 'speakerA',
              text: 'Am Sonntag kühlt es dann überall spürbar ab — die Temperaturen fallen im ganzen Land auf elf bis vierzehn Grad und es regnet verbreitet.',
              english:
                'On Sunday it then cools down noticeably everywhere — temperatures drop across the whole country to 11 to 14 degrees and rain is widespread.',
            },
          ],
        },
      ],
      items: [
        {
          number: 1,
          clipId: 'b1-t1-c1',
          format: 'rf',
          prompt: 'Herr Lindners neue Brille ist früher fertig als geplant.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 0,
          evidenceQuote: '„Ihre neue Gleitsichtbrille ist schon heute fertig geworden — eigentlich hatten wir ja erst kommenden Montag vereinbart.“',
          explanation: 'Richtig! Originally planned for Monday, it is already ready today.',
        },
        {
          number: 2,
          clipId: 'b1-t1-c1',
          format: 'mcq',
          prompt: 'Was soll Herr Lindner beim Abholen mitbringen?',
          options: [
            'a) Den Restbetrag in bar',
            'b) Seinen alten Brillenpass',
            'c) Die Rechnung von Montag',
          ],
          correctIndex: 1,
          evidenceQuote: '„Bitte bringen Sie aber unbedingt Ihren alten Brillenpass mit ...“',
          explanation: 'Everything is already paid; he only must bring his old glasses prescription card (Brillenpass).',
        },
        {
          number: 3,
          clipId: 'b1-t1-c2',
          format: 'rf',
          prompt: 'Der Englischkurs am Dienstag findet wie geplant statt.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 1,
          evidenceQuote: '„Leider haben sich für die Dienstagsgruppe nur vier Personen angemeldet, weshalb der Kurs nicht stattfinden kann.“',
          explanation: 'Falsch! Too few registrations (only 4), so the Tuesday group is canceled.',
        },
        {
          number: 4,
          clipId: 'b1-t1-c2',
          format: 'mcq',
          prompt: 'Was bietet das Sprachinstitut Frau Kaya an?',
          options: [
            'a) Einen Wechsel in die Donnerstagsgruppe ohne Aufpreis',
            'b) Einzelunterricht am Dienstagabend',
            'c) Einen Gutschein für Lehrbücher',
          ],
          correctIndex: 0,
          evidenceQuote: '„Wir bieten Ihnen aber an, ohne Aufpreis in die Donnerstagsgruppe zu wechseln oder die gesamte Kursgebühr zurückzubekommen.“',
          explanation: 'She can switch to Thursday at no extra charge or get a full refund.',
        },
        {
          number: 5,
          clipId: 'b1-t1-c3',
          format: 'rf',
          prompt: 'Im Stadtzentrum von Frankfurt gibt es Straßensperrungen wegen einer Sportveranstaltung.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 0,
          evidenceQuote: '„Im Frankfurter Stadtzentrum sind zudem mehrere Straßen rund um den Hauptbahnhof wegen eines Radrennens gesperrt.“',
          explanation: 'Richtig! Streets are closed because of a bicycle race (Radrennen).',
        },
        {
          number: 6,
          clipId: 'b1-t1-c3',
          format: 'mcq',
          prompt: 'Warum gibt es auf der Autobahn A3 einen Stau?',
          options: [
            'a) Wegen eines Unfalls',
            'b) Wegen einer Baustelle',
            'c) Wegen des Radrennens',
          ],
          correctIndex: 1,
          evidenceQuote: '„Auf der Autobahn A3 Richtung Köln stehen Sie ... wegen einer Baustelle auf acht Kilometern im Stau.“',
          explanation: 'The A3 jam is caused by construction (Baustelle); the bike race affects downtown Frankfurt.',
        },
        {
          number: 7,
          clipId: 'b1-t1-c4',
          format: 'rf',
          prompt: 'Der Zug nach Innsbruck fällt heute ebenfalls aus.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 1,
          evidenceQuote: '„Reisende nach Innsbruck benutzen bitte unverändert Gleis neun.“',
          explanation: 'Falsch! Only the Eurocity to Salzburg is canceled; Innsbruck departs unchanged from platform 9.',
        },
        {
          number: 8,
          clipId: 'b1-t1-c4',
          format: 'mcq',
          prompt: 'Was gilt für den Ersatzzug nach Salzburg um 10:50 Uhr?',
          options: [
            'a) Er fährt von Gleis 9 ab.',
            'b) Er hat keinen Speisewagen.',
            'c) Er benötigt eine neue Reservierung.',
          ],
          correctIndex: 1,
          evidenceQuote: '„... bitte beachten Sie, dass dieser Zug keinen Speisewagen führt.“',
          explanation: 'The 10:50 Regional Express from platform 6 has no dining car.',
        },
        {
          number: 9,
          clipId: 'b1-t1-c5',
          format: 'rf',
          prompt: 'Am Samstag bleibt es im Norden Deutschlands überwiegend trocken.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 0,
          evidenceQuote: '„Während es im Norden Deutschlands am Samstag noch freundlich und trocken bei rund achtzehn Grad bleibt ...“',
          explanation: 'Richtig! Northern Germany stays friendly and dry on Saturday.',
        },
        {
          number: 10,
          clipId: 'b1-t1-c5',
          format: 'mcq',
          prompt: 'Wie wird das Wetter am Sonntag?',
          options: [
            'a) Sonnig und über 20 Grad warm',
            'b) Deutlich kühler mit verbreitetem Regen',
            'c) Nur in den Alpen windig, sonst trocken',
          ],
          correctIndex: 1,
          evidenceQuote: '„Am Sonntag kühlt es dann überall spürbar ab — die Temperaturen fallen ... auf elf bis vierzehn Grad und es regnet verbreitet.“',
          explanation: 'Sunday cools down nationwide to 11–14°C with widespread rain.',
        },
      ],
    },

    // ======================== TEIL 2 (Items 11-15) ========================
    {
      partNumber: 2,
      title: 'Teil 2',
      subtitle: 'Vortrag / Führung · Aufgaben 11–15 · 1× hören',
      instructions:
        'Sie nehmen an einer Führung durch die Hamburger Speicherstadt und das Kaffeemuseum teil. Sie hören den Text einmal. Wählen Sie bei jeder Aufgabe die richtige Lösung a, b oder c.',
      playsAllowed: 1,
      readingPrepSeconds: 60,
      clips: [
        {
          id: 'b1-t2-c1',
          label: 'Führung · Hamburger Speicherstadt',
          intro: 'Sie nehmen an einer Führung durch die Hamburger Speicherstadt teil.',
          lines: [
            {
              speaker: 'Stadtführer (Markus)',
              voiceRole: 'speakerB',
              text: 'Herzlich willkommen hier in der Hamburger Speicherstadt! Mein Name ist Markus und ich freue mich, dass Sie trotz des kühlen Windes so zahlreich erschienen sind. Normalerweise drängen sich um diese Uhrzeit ganze Busladungen auf den Brücken, aber weil heute Dienstagvormittag ist, haben wir die Wege fast für uns allein.',
              english:
                'Welcome here to Hamburg’s Speicherstadt! My name is Markus and I am pleased that you turned up in such numbers despite the cool wind. Normally busloads crowd the bridges at this hour, but because it’s Tuesday morning, we have the paths almost to ourselves.',
            },
            {
              speaker: 'Stadtführer (Markus)',
              voiceRole: 'speakerB',
              text: 'Unser gemeinsamer Rundgang dauert etwa neunzig Minuten. Zuerst spazieren wir entlang der historischen roten Backsteinhäuser und ich erzähle Ihnen, wie vor über hundert Jahren Tee, Gewürze und Teppiche aus aller Welt hier gelagert wurden. Anschließend besuchen wir gemeinsam das kleine Kaffeemuseum im Keller eines alten Speichers.',
              english:
                'Our joint walking tour lasts about 90 minutes. First we walk along the historic red brick warehouses and I will tell you how tea, spices, and carpets from all over the world were stored here over a hundred years ago. Afterward we visit the small Coffee Museum together in the cellar of an old warehouse.',
            },
            {
              speaker: 'Stadtführer (Markus)',
              voiceRole: 'speakerB',
              text: 'Nach dem Museum haben Sie noch eine Stunde Freizeit, bevor wir uns um dreizehn Uhr dreißig wieder direkt vor dem Haupteingang der Elbphilharmonie treffen. Ihre Rucksäcke können Sie während der Museumsführung kostenfrei an der Kasse abgeben; fotografieren dürfen Sie im gesamten Gebäude, nur Videos sind nicht gestattet.',
              english:
                'After the museum you still have one hour of free time before we meet again at 1:30 PM directly in front of the main entrance of the Elbphilharmonie. You can leave your backpacks free of charge at the ticket desk during the museum tour; photography is permitted throughout the building, only videos are not allowed.',
            },
            {
              speaker: 'Stadtführer (Markus)',
              voiceRole: 'speakerB',
              text: 'Wenn Sie nach unserer Tour Hunger bekommen, empfehle ich Ihnen unbedingt eines der kleinen Fischbrötchen-Lokale direkt am Hafenbecken. Zwar gibt es hier in der HafenCity viele schicke internationale Restaurants, aber ein frisches Fischbrötchen gehört zu einem echten Hamburg-Besuch einfach dazu. So, dann folgen Sie mir bitte über die erste Brücke!',
              english:
                'If you get hungry after our tour, I definitely recommend one of the small fish-sandwich stalls right on the harbor basin. Although there are many fancy international restaurants here in HafenCity, a fresh fish roll simply belongs to a genuine Hamburg visit. Right, please follow me across the first bridge!',
            },
          ],
        },
      ],
      items: [
        {
          number: 11,
          clipId: 'b1-t2-c1',
          format: 'mcq',
          prompt: 'Wie ist die Situation heute Vormittag in der Speicherstadt?',
          options: [
            'a) Es sind außergewöhnlich viele Busgruppen unterwegs.',
            'b) Es ist ziemlich ruhig und wenig los.',
            'c) Ein Teil der Brücken ist wegen Bauarbeiten gesperrt.',
          ],
          correctIndex: 1,
          evidenceQuote: '„... aber weil heute Dienstagvormittag ist, haben wir die Wege fast für uns allein.“',
          explanation: 'Normally crowded, today (Tuesday morning) it is quiet and nearly empty.',
        },
        {
          number: 12,
          clipId: 'b1-t2-c1',
          format: 'mcq',
          prompt: 'Was besucht die Gruppe gemeinsam mit Markus?',
          options: [
            'a) Die Elbphilharmonie von innen',
            'b) Das Kaffeemuseum in einem alten Speicher',
            'c) Eine Hafenrundfahrt mit dem Schiff',
          ],
          correctIndex: 1,
          evidenceQuote: '„Anschließend besuchen wir gemeinsam das kleine Kaffeemuseum im Keller eines alten Speichers.“',
          explanation: 'They walk past the warehouses and jointly visit the Coffee Museum.',
        },
        {
          number: 13,
          clipId: 'b1-t2-c1',
          format: 'mcq',
          prompt: 'Wo trifft sich die Gruppe nach der freien Zeit um 13:30 Uhr?',
          options: [
            'a) An der Kasse des Kaffeemuseums',
            'b) Auf der ersten Brücke',
            'c) Vor dem Haupteingang der Elbphilharmonie',
          ],
          correctIndex: 2,
          evidenceQuote: '„... bevor wir uns um dreizehn Uhr dreißig wieder direkt vor dem Haupteingang der Elbphilharmonie treffen.“',
          explanation: 'The afternoon meeting point is in front of the main entrance of the Elbphilharmonie.',
        },
        {
          number: 14,
          clipId: 'b1-t2-c1',
          format: 'mcq',
          prompt: 'Was ist im Kaffeemuseum NICHT erlaubt?',
          options: [
            'a) Fotos zu machen',
            'b) Videos aufzunehmen',
            'c) Rucksäcke an der Kasse abzugeben',
          ],
          correctIndex: 1,
          evidenceQuote: '„... fotografieren dürfen Sie im gesamten Gebäude, nur Videos sind nicht gestattet.“',
          explanation: 'Photos are permitted everywhere, but recording videos is not allowed.',
        },
        {
          number: 15,
          clipId: 'b1-t2-c1',
          format: 'mcq',
          prompt: 'Was empfiehlt der Stadtführer zum Mittagessen?',
          options: [
            'a) Ein schickes internationales Restaurant',
            'b) Ein frisches Fischbrötchen am Hafen',
            'c) Das Café im Kaffeemuseum',
          ],
          correctIndex: 1,
          evidenceQuote: '„... empfehle ich Ihnen unbedingt eines der kleinen Fischbrötchen-Lokale direkt am Hafenbecken.“',
          explanation: 'He dismisses fancy international restaurants and specifically recommends a fresh fish sandwich by the harbor.',
        },
      ],
    },

    // ======================== TEIL 3 (Items 16-22) ========================
    {
      partNumber: 3,
      title: 'Teil 3',
      subtitle: 'Alltagsgespräch · Aufgaben 16–22 · 1× hören',
      instructions:
        'Sie sitzen im Zug und hören, wie sich zwei Freunde, Katja und Jonas, über einen Kochkurs und das Wochenende unterhalten. Sie hören das Gespräch einmal. Wählen Sie: Richtig oder Falsch?',
      playsAllowed: 1,
      readingPrepSeconds: 60,
      clips: [
        {
          id: 'b1-t3-c1',
          label: 'Gespräch · Katja & Jonas im Zug',
          intro: 'Zwei Freunde unterhalten sich über einen italienischen Kochkurs am Wochenende.',
          lines: [
            {
              speaker: 'Jonas',
              voiceRole: 'speakerB',
              text: 'Hey Katja! Was für ein Zufall, dich hier im Regionalzug zu treffen! Wie war dein Wochenende? Du wolltest doch diesen italienischen Kochkurs machen, oder?',
              english:
                'Hey Katja! What a coincidence meeting you here on the regional train! How was your weekend? You wanted to take that Italian cooking class, right?',
            },
            {
              speaker: 'Katja',
              voiceRole: 'speakerA',
              text: 'Hallo Jonas! Ja genau — eigentlich hatte meine Schwester mir den Gutschein schon zu Weihnachten geschenkt, aber erst jetzt am Samstag gab es wieder einen freien Platz.',
              english:
                'Hi Jonas! Yes exactly — actually my sister had already given me the voucher for Christmas, but only now on Saturday was there a free spot again.',
            },
            {
              speaker: 'Jonas',
              voiceRole: 'speakerB',
              text: 'Und, hat es sich gelohnt? War die Gruppe sehr groß?',
              english: 'And was it worth it? Was the group very big?',
            },
            {
              speaker: 'Katja',
              voiceRole: 'speakerA',
              text: 'Überhaupt nicht! Wir waren nur acht Teilnehmer in einer super modernen Küche in der Altstadt. Unser Koch, Marco, kommt ursprünglich aus Neapel und arbeitet hier als Chefkoch in einem kleinen Familienrestaurant.',
              english:
                'Not at all! There were only eight participants in a super modern kitchen in the old town. Our chef, Marco, originally comes from Naples and works here as head chef in a small family restaurant.',
            },
            {
              speaker: 'Jonas',
              voiceRole: 'speakerB',
              text: 'Klingt genial! Habt ihr Pizza gebacken?',
              english: 'Sounds brilliant! Did you bake pizza?',
            },
            {
              speaker: 'Katja',
              voiceRole: 'speakerA',
              text: 'Das dachten am Anfang fast alle! Aber Marco wollte uns zeigen, wie man frische Pasta mit der Hand macht — also Tagliatelle und gefüllte Ravioli. Nur mein erster Nudelteig war leider viel zu trocken und ist sofort gerissen.',
              english:
                'Almost everyone thought that at first! But Marco wanted to show us how to make fresh pasta by hand — tagliatelle and filled ravioli. Only my first pasta dough was unfortunately way too dry and tore immediately.',
            },
            {
              speaker: 'Jonas',
              voiceRole: 'speakerB',
              text: 'Oh nein! Und dann?',
              english: 'Oh no! And then?',
            },
            {
              speaker: 'Katja',
              voiceRole: 'speakerA',
              text: 'Marco hat gelacht, ein bisschen Olivenöl und ein Ei dazugegeben, und beim zweiten Versuch hat es wunderbar geklappt! Am Ende haben wir alle zusammen an einer langen Tafel gegessen — sogar Tiramisu als Dessert. Es wurde fast halb elf abends, bis wir gegangen sind.',
              english:
                'Marco laughed, added a little olive oil and an egg, and on the second attempt it worked wonderfully! At the end we all ate together at a long table — even tiramisu for dessert. It was almost 10:30 PM by the time we left.',
            },
            {
              speaker: 'Jonas',
              voiceRole: 'speakerB',
              text: 'Stark! Willst du noch einen Kurs besuchen?',
              english: 'Awesome! Do you want to take another course?',
            },
            {
              speaker: 'Katja',
              voiceRole: 'speakerA',
              text: 'Auf jeden Fall! Nächsten Monat bietet Marco einen Kurs für vegetarische Vorspeisen an, da habe ich mich gleich gestern Abend online angemeldet. Wenn du Lust hast, komm doch einfach mit!',
              english:
                'Definitely! Next month Marco is offering a course on vegetarian starters, and I signed up online right away last night. If you feel like it, just come along!',
            },
          ],
        },
      ],
      items: [
        {
          number: 16,
          clipId: 'b1-t3-c1',
          format: 'rf',
          prompt: 'Katja hat den Kochkurs selbst als Geburtstagsgeschenk gekauft.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 1,
          evidenceQuote: '„... eigentlich hatte meine Schwester mir den Gutschein schon zu Weihnachten geschenkt ...“',
          explanation: 'Falsch! Her sister gifted her the voucher for Christmas.',
        },
        {
          number: 17,
          clipId: 'b1-t3-c1',
          format: 'rf',
          prompt: 'An dem Kochkurs nahmen nur wenige Personen teil.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 0,
          evidenceQuote: '„Überhaupt nicht! Wir waren nur acht Teilnehmer in einer super modernen Küche ...“',
          explanation: 'Richtig! Only 8 participants took part.',
        },
        {
          number: 18,
          clipId: 'b1-t3-c1',
          format: 'rf',
          prompt: 'Der Kursleiter Marco stammt aus Italien.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 0,
          evidenceQuote: '„Unser Koch, Marco, kommt ursprünglich aus Neapel ...“',
          explanation: 'Richtig! Marco is originally from Naples (Neapel), Italy.',
        },
        {
          number: 19,
          clipId: 'b1-t3-c1',
          format: 'rf',
          prompt: 'Die Gruppe hat im Kurs gelernt, neapolitanische Pizza zu backen.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 1,
          evidenceQuote: '„Das dachten am Anfang fast alle! Aber Marco wollte uns zeigen, wie man frische Pasta mit der Hand macht ...“',
          explanation: 'Falsch! Classic distractor: everyone expected pizza, but they made fresh handmade pasta (Tagliatelle & Ravioli).',
        },
        {
          number: 20,
          clipId: 'b1-t3-c1',
          format: 'rf',
          prompt: 'Katjas erster Nudelteig ist nicht richtig gelungen.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 0,
          evidenceQuote: '„Nur mein erster Nudelteig war leider viel zu trocken und ist sofort gerissen.“',
          explanation: 'Richtig! Her first dough was too dry and tore; the second try succeeded.',
        },
        {
          number: 21,
          clipId: 'b1-t3-c1',
          format: 'rf',
          prompt: 'Der Abend dauerte bis nach Mitternacht.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 1,
          evidenceQuote: '„Es wurde fast halb elf abends, bis wir gegangen sind.“',
          explanation: 'Falsch! They left around 10:30 PM (halb elf), not after midnight.',
        },
        {
          number: 22,
          clipId: 'b1-t3-c1',
          format: 'rf',
          prompt: 'Katja hat sich bereits für einen weiteren Kurs bei Marco angemeldet.',
          options: ['Richtig', 'Falsch'],
          correctIndex: 0,
          evidenceQuote: '„... Kurs für vegetarische Vorspeisen an, da habe ich mich gleich gestern Abend online angemeldet.“',
          explanation: 'Richtig! She already registered online last night for next month’s course.',
        },
      ],
    },

    // ======================== TEIL 4 (Items 23-30 — WER SAGT WAS? MATRIX) ========================
    {
      partNumber: 4,
      title: 'Teil 4',
      subtitle: 'Radiodiskussion · Wer sagt was? · Aufgaben 23–30 · 2× hören',
      instructions:
        'Der Moderator der Radiosendung „Diskussion am Abend“ spricht mit der Unternehmerin Sabine Keller und dem Gewerkschaftsvertreter Tobias Braun zum Thema „Ist die Vier-Tage-Woche die Zukunft?“. Sie hören die Diskussion zweimal. Ordnen Sie zu: Wer sagt was?',
      playsAllowed: 2,
      readingPrepSeconds: 60,
      speakerColumns: ['Moderator', 'Sabine Keller', 'Tobias Braun'],
      clips: [
        {
          id: 'b1-t4-c1',
          label: 'Radiodiskussion · Die 4-Tage-Woche',
          intro: 'Moderator, Sabine Keller (Unternehmerin) und Tobias Braun (Gewerkschaft) diskutieren.',
          lines: [
            {
              speaker: 'Moderator',
              voiceRole: 'narrator',
              text: 'Guten Abend und herzlich willkommen bei „Diskussion am Abend“! Immer mehr Länder testen die Vier-Tage-Woche bei vollem Gehalt. Heute frage ich unsere Gäste: Ist weniger Arbeitszeit wirklich die Lösung für den Fachkräftemangel? Bei mir sind Unternehmerin Sabine Keller und Gewerkschaftsvertreter Tobias Braun.',
              english:
                'Good evening and welcome to “Evening Discussion”! More and more countries are testing the four-day week at full pay. Today I ask our guests: Is less working time really the solution to the skilled-labor shortage? With me are entrepreneur Sabine Keller and union representative Tobias Braun.',
            },
            {
              speaker: 'Tobias Braun',
              voiceRole: 'speakerB',
              text: 'Eindeutig ja! Studien aus Großbritannien und Deutschland zeigen ganz klar: Wer nur vier Tage arbeitet, ist deutlich erholter, macht weniger Fehler und bleibt seltener krank. Am Ende sinkt die Produktivität überhaupt nicht.',
              english:
                'Clearly yes! Studies from Great Britain and Germany clearly show: People who only work four days are significantly more rested, make fewer mistakes, and call in sick less often. In the end productivity doesn’t drop at all.',
            },
            {
              speaker: 'Sabine Keller',
              voiceRole: 'speakerA',
              text: 'Das mag in einer Werbeagentur oder einer Softwarefirma funktionieren, Herr Braun. Aber ich leite eine Bäckereikette mit vierzig Angestellten. Wenn meine Verkäuferinnen einen Tag weniger im Laden stehen, backt sich das Brot ja nicht von selbst! Im Handwerk und in der Pflege lässt sich Arbeitszeit nicht einfach verdichten.',
              english:
                'That may work in an ad agency or a software company, Mr. Braun. But I run a bakery chain with 40 employees. If my sales staff work one day less in the shop, the bread doesn’t bake itself! In skilled trades and nursing, work hours can’t simply be compressed.',
            },
            {
              speaker: 'Moderator',
              voiceRole: 'narrator',
              text: 'Ein wichtiger Einwand, Frau Keller — viele kleine Betriebe befürchten steigende Lohnkosten, wenn sie zusätzliches Personal einstellen müssen. Herr Braun, wie soll ein kleiner Betrieb das finanzieren?',
              english:
                'An important objection, Ms. Keller — many small businesses fear rising wage costs if they have to hire additional staff. Mr. Braun, how is a small business supposed to finance that?',
            },
            {
              speaker: 'Tobias Braun',
              voiceRole: 'speakerB',
              text: 'Man darf das Modell nicht starr für jede Branche gleich vorschreiben. In manchen Betrieben kann man zum Beispiel vier Tage à neun Stunden arbeiten, oder abwechselnde Teams bilden. Wichtig ist vor allem, dass Beschäftigte mehr Zeit für Familie, Weiterbildung und Ehrenamt bekommen.',
              english:
                'One mustn’t rigidly prescribe the exact same model for every industry. In some firms one can work four nine-hour days, or form rotating teams. What matters most is that employees get more time for family, further education, and volunteering.',
            },
            {
              speaker: 'Sabine Keller',
              voiceRole: 'speakerA',
              text: 'Gegen flexible Arbeitszeiten habe ich überhaupt nichts — viele meiner Mitarbeiterinnen arbeiten schon heute freiwillig in Teilzeit. Aber volles Gehalt bei zwanzig Prozent weniger Stunden könnten wir nur über deutlich höhere Brotpreise bezahlen, und das würden unsere Kunden nicht akzeptieren.',
              english:
                'I have nothing at all against flexible working hours — many of my employees already voluntarily work part-time today. But full pay for 20 percent fewer hours could only be funded via significantly higher bread prices, and our customers wouldn’t accept that.',
            },
            {
              speaker: 'Moderator',
              voiceRole: 'narrator',
              text: 'Aber vielleicht hilft eine attraktivere Arbeitszeit gerade dabei, überhaupt wieder junge Auszubildende für das Handwerk zu gewinnen? Denn viele Stellen bleiben momentan monatelang unbesetzt.',
              english:
                'But perhaps more attractive working hours specifically help win young apprentices back into the trades? Because many positions currently remain unfilled for months.',
            },
            {
              speaker: 'Sabine Keller',
              voiceRole: 'speakerA',
              text: 'Da haben Sie teilweise recht — junge Leute achten heute viel stärker auf Freizeit als früher. Deshalb bieten wir unseren Azubis bereits jedes zweite Wochenende komplett frei an, das kommt sehr gut an.',
              english:
                'You’re partly right there — young people pay much more attention to free time today than in the past. That’s why we already offer our apprentices every second weekend completely off, which is very well received.',
            },
            {
              speaker: 'Tobias Braun',
              voiceRole: 'speakerB',
              text: 'Sehen Sie, genau solche praktischen Schritte zeigen doch, dass Veränderung möglich ist, wenn Arbeitgeber und Beschäftigte gemeinsam nach guten Lösungen suchen!',
              english:
                'You see, precisely such practical steps show that change is possible when employers and employees search for good solutions together!',
            },
          ],
        },
      ],
      items: [
        {
          number: 23,
          clipId: 'b1-t4-c1',
          format: 'speaker_matrix',
          prompt: 'Mitarbeitende sind bei einer Vier-Tage-Woche gesünder und machen weniger Fehler.',
          options: ['Moderator', 'Sabine Keller', 'Tobias Braun'],
          correctIndex: 2,
          evidenceQuote: 'Tobias Braun: „... ist deutlich erholter, macht weniger Fehler und bleibt seltener krank.“',
          explanation: 'Tobias Braun cites studies showing fewer sick days and fewer mistakes.',
        },
        {
          number: 24,
          clipId: 'b1-t4-c1',
          format: 'speaker_matrix',
          prompt: 'In Pflegeberufen und im Handwerk lässt sich die Arbeit nicht einfach auf vier Tage verteilen.',
          options: ['Moderator', 'Sabine Keller', 'Tobias Braun'],
          correctIndex: 1,
          evidenceQuote: 'Sabine Keller: „Im Handwerk und in der Pflege lässt sich Arbeitszeit nicht einfach verdichten.“',
          explanation: 'Sabine Keller explains why bakeries, trades, and nursing differ from software offices.',
        },
        {
          number: 25,
          clipId: 'b1-t4-c1',
          format: 'speaker_matrix',
          prompt: 'Kleine Firmen machen sich Sorgen wegen höherer Lohnkosten durch neues Personal.',
          options: ['Moderator', 'Sabine Keller', 'Tobias Braun'],
          correctIndex: 0,
          evidenceQuote: 'Moderator: „... viele kleine Betriebe befürchten steigende Lohnkosten, wenn sie zusätzliches Personal einstellen müssen.“',
          explanation: 'The Moderator raises this financing objection on behalf of small businesses.',
        },
        {
          number: 26,
          clipId: 'b1-t4-c1',
          format: 'speaker_matrix',
          prompt: 'Es sollte kein einheitliches starres Modell für alle Branchen vorgeschrieben werden.',
          options: ['Moderator', 'Sabine Keller', 'Tobias Braun'],
          correctIndex: 2,
          evidenceQuote: 'Tobias Braun: „Man darf das Modell nicht starr für jede Branche gleich vorschreiben.“',
          explanation: 'Tobias Braun argues for flexible branch-specific solutions.',
        },
        {
          number: 27,
          clipId: 'b1-t4-c1',
          format: 'speaker_matrix',
          prompt: 'Kunden wären nicht bereit, deutlich höhere Preise für Brot zu zahlen.',
          options: ['Moderator', 'Sabine Keller', 'Tobias Braun'],
          correctIndex: 1,
          evidenceQuote: 'Sabine Keller: „... über deutlich höhere Brotpreise bezahlen, und das würden unsere Kunden nicht akzeptieren.“',
          explanation: 'Sabine Keller notes her bakery customers would reject steep price hikes.',
        },
        {
          number: 28,
          clipId: 'b1-t4-c1',
          format: 'speaker_matrix',
          prompt: 'Bessere Arbeitszeiten könnten helfen, offene Ausbildungsstellen zu besetzen.',
          options: ['Moderator', 'Sabine Keller', 'Tobias Braun'],
          correctIndex: 0,
          evidenceQuote: 'Moderator: „Aber vielleicht hilft eine attraktivere Arbeitszeit gerade dabei, überhaupt wieder junge Auszubildende ... zu gewinnen?“',
          explanation: 'The Moderator brings up attracting apprentices for unfilled positions.',
        },
        {
          number: 29,
          clipId: 'b1-t4-c1',
          format: 'speaker_matrix',
          prompt: 'Junge Menschen legen heute deutlich mehr Wert auf ihre Freizeit als frühere Generationen.',
          options: ['Moderator', 'Sabine Keller', 'Tobias Braun'],
          correctIndex: 1,
          evidenceQuote: 'Sabine Keller: „... junge Leute achten heute viel stärker auf Freizeit als früher.“',
          explanation: 'Sabine Keller acknowledges this shift and mentions giving apprentices every second weekend off.',
        },
        {
          number: 30,
          clipId: 'b1-t4-c1',
          format: 'speaker_matrix',
          prompt: 'Veränderungen gelingen, wenn Betriebe und Arbeitnehmende gemeinsam Lösungen entwickeln.',
          options: ['Moderator', 'Sabine Keller', 'Tobias Braun'],
          correctIndex: 2,
          evidenceQuote: 'Tobias Braun: „... dass Veränderung möglich ist, wenn Arbeitgeber und Beschäftigte gemeinsam nach guten Lösungen suchen!“',
          explanation: 'Tobias Braun closes with this collaborative conclusion.',
        },
      ],
    },
  ],
};
