const fs = require('fs');

const FILES = ['en/cennik.html', 'en/uslugi.html', 'en/sprzet.html', 'en/galeria.html', 'en/faq.html', 'en/index.html'];

const dict = {
    // Nav Menu & Buttons
    "Cennik": "Pricing",
    "Usługi": "Services",
    "Sprzęt": "Equipment",
    "O nas": "About Us",
    "Galeria": "Gallery",
    "Kontakt": "Contact",
    "Zadzwoń": "Call",
    "Wyślij Zgłoszenie": "Send Request",
    "Strona Główna": "Home",
    "Powrót do strony głównej": "Back to home page",

    // Cennik
    "Ile kosztuje wykrywanie wycieków? Informacje o cenach dla mieszkań, domów i firm. Dowiedz się jak rozliczyć usługę z ubezpieczenia.": "How much does leak detection cost? Pricing info for apartments, houses and businesses. Learn how to settle the service with insurance.",
    "Cena poszukiwania w mieszkaniach i kawalerkach, gdzie usługa skupia się na precyzyjnej diagnostyce kompaktowych instalacji w obrębie jednego lokalu.": "Price for leak detection in apartments and studios, where the service focuses on precise diagnostics of compact systems within a single premises.",
    "Cena poszukiwania w domach, bliźniakach, biurach i innej komercji, gdzie specyfika dużych obiektów wymaga szczegółowego sprawdzenia wielu skomplikowanych układów wodnych, grzewczych oraz kanalizacyjnych na znacznie większym metrażu.": "Price for leak detection in houses, semi-detached houses, offices and other commercial buildings, where the specificity of large facilities requires a detailed inspection of many complex water, heating and sewage systems over a much larger area.",
    "W miarę możliwości technicznych oferujemy szybkie usunięcie awarii na miejscu. Decyzja o wykonaniu takiej naprawy zależy wyłącznie od stopnia skomplikowania usterki oraz dostępności specjalistycznego sprzętu i jest podejmowana na miejscu.": "As far as technical possibilities allow, we offer quick fault removal on site. The decision to perform such a repair depends solely on the complexity of the fault and the availability of specialized equipment and is made on site.",
    "Bezkosztowo z ubezpieczenia (Assistance)": "Free of charge from insurance (Assistance)",
    "Pamiętaj, że koszty poszukiwania i lokalizacji przyczyn szkody wodnej są zazwyczaj w 100% zwracane przez ubezpieczyciela (np. PZU, Warta, Allianz, Ergo Hestia).": "Remember that the costs of searching and locating the causes of water damage are usually 100% reimbursed by the insurer (e.g. PZU, Warta, Allianz, Ergo Hestia).",
    "Po zakończeniu prac otrzymasz od nas komplet dokumentów niezbędnych do wypłaty odszkodowania:": "After completing the work, you will receive a complete set of documents necessary for the payment of compensation:",
    "Szczegółowy protokół techniczny z opisem metod": "Detailed technical report with a description of methods",
    "Dokumentację zdjęciową i wideo (np. z kamery inspekcyjnej)": "Photo and video documentation (e.g. from an inspection camera)",
    "Fakturę VAT": "VAT Invoice",
    "Często zadawane pytania": "Frequently Asked Questions",
    "Czy pobieracie opłatę, jeśli nie znajdziecie wycieku?": "Do you charge a fee if you don't find a leak?",
    "Działamy w oparciu o zasadę \"No Success, No Full Fee\".": "We operate on a \"No Success, No Full Fee\" basis.",
    "Jak przygotować się do wizyty?": "How to prepare for a visit?",
    "Warto zapewnić dostęp do głównych zaworów wody oraz upewnić się, że w czasie badań nikt nie będzie korzystał z urządzeń sanitarnych. W przypadku ogrzewania podłogowego, najlepiej włączyć je na 2-3 godziny przed naszym przyjazdem.": "It is worth ensuring access to the main water valves and making sure that no one will use the sanitary facilities during the tests. In the case of underfloor heating, it is best to turn it on 2-3 hours before our arrival.",
    "Czy niszczycie ściany podczas szukania?": "Do you destroy walls while searching?",
    "Nie! Nasza praca polega właśnie na tym, aby uniknąć niszczenia mienia. Kucie wykonujemy dopiero w momencie, gdy jesteśmy pewni miejsca awarii, i ograniczamy je do niezbędnego minimum (często tylko jedna płytka).": "No! Our job is precisely to avoid destroying property. We only start breaking when we are certain of the fault's location, and we limit it to the absolute minimum (often just one tile).",

    // Uslugi
    "Nasze Usługi": "Our Services",
    "Szczegółowy opis usług wykrywania wycieków wody. Lokalizacja wycieków z rur, ogrzewania podłogowego, dachów i kanalizacji.": "Detailed description of water leak detection services. Location of leaks from pipes, underfloor heating, roofs and sewage.",
    "Precyzyjna diagnostyka wycieków, bezinwazyjna lokalizacja usterki oraz pełne wsparcie w profesjonalnym osuszaniu po zalaniu.": "Precise leak diagnostics, non-invasive fault location and full support in professional drying after flooding.",
    "Instalacje Wodne": "Water Installations",
    "Lokalizacja wycieków z rur": "Pipe leak detection",
    "Wykorzystujemy metody akustyczne i gaz znacznikowy, aby precyzyjnie wskazać miejsce uszkodzenia rur wodnych i grzewczych ukrytych w ścianach i podłogach. Dzięki temu unikasz niepotrzebnego kucia całej łazienki czy kuchni.": "We use acoustic methods and tracer gas to precisely pinpoint the location of damage to water and heating pipes hidden in walls and floors. This avoids unnecessary demolition of the entire bathroom or kitchen.",
    "Nasi specjaliści posiadają certyfikowane urządzenia do wykrywania nieszczelności w instalacjach z miedzi, PEX, PP i stali.": "Our specialists have certified equipment for detecting leaks in copper, PEX, PP and steel installations.",
    "Instalacje zimnej i ciepłej wody (Z.W. / C.W.U.)": "Cold and hot water installations (Z.W. / C.W.U.)",
    "Piony kanalizacyjne i rury odpływowe": "Sewage risers and drain pipes",
    "Instalacje centralnego ogrzewania (C.O.)": "Central heating installations (C.O.)",
    "Termowizja": "Thermal Imaging",
    "Awarie ogrzewania podłogowego są szczególnie trudne do zlokalizowania bez specjalistycznego sprzętu. Używamy kamer termowizyjnych o wysokiej rozdzielczości, aby \"zobaczyć\" przebieg rur pod posadzką i zidentyfikować punktowy wyciek.": "Underfloor heating failures are particularly difficult to locate without specialized equipment. We use high-resolution thermal imaging cameras to \"see\" the path of the pipes under the floor and identify a pinpoint leak.",
    "Metoda ta pozwala na precyzyjne wskazanie miejsca awarii, co ogranicza naprawę do wymiany zaledwie jednej płytki czy niewielkiego fragmentu paneli.": "This method allows precise identification of the fault location, limiting repair to replacing just one tile or a small fragment of panels.",
    "Hydroizolacja": "Waterproofing",
    "Wycieki na dachach płaskich i tarasach często objawiają się w zupełnie innym miejscu, niż znajduje się źródło problemu. Stosujemy metody dymowe i wilgotnościowe, aby znaleźć nieszczelność w hydroizolacji.": "Leaks on flat roofs and terraces often appear in a completely different place than the source of the problem. We use smoke and moisture methods to find leaks in waterproofing.",
    "Dokładna analiza pozwala uniknąć kosztownej wymiany całego pokrycia dachowego, skupiając się jedynie na nieszczelnym punkcie.": "A thorough analysis helps avoid the costly replacement of the entire roof covering, focusing only on the leaking point.",

    // Sprzet
    "Nasz Sprzęt": "Our Equipment",
    "Sprzęt Diagnostyczny — WyciekiPro": "Diagnostic Equipment — WyciekiPro",
    "Nasze technologie: geofony, kamery termowizyjne, detektory gazu i endoskopy. Zobacz czym wykrywamy wycieki.": "Our technologies: geophones, thermal imaging cameras, gas detectors and endoscopes. See how we detect leaks.",
    "Wykorzystujemy najnowocześniejszy sprzęt diagnostyczny dostępny na rynku.": "We use the most modern diagnostic equipment available on the market.",
    "DOKŁADNA LOKALIZACJA PUNKTOWA": "PRECISE PINPOINT LOCATION",
    "Geofon wysokoczuły Trubolab A-10T3": "Highly sensitive geophone Trubolab A-10T3",
    "Geofon elektroniczny wkracza do akcji na etapie <strong>ścisłego ustalania i dokładnej lokalizacji</strong> punktu wycieku. Słyszy szum wypływającej wody z uszkodzonej rury.": "The electronic geophone comes into action at the stage of <strong>strict determination and precise location</strong> of the leak point. It hears the noise of water flowing from a damaged pipe.",
    "Po zweryfikowaniu instalacji manometrem i wstępnym wytypowaniu miejsca, to właśnie geofon (oraz gaz znacznikowy) służą do wskazania dokładnego miejsca o wymiarach 10-20 cm, w którym ostatecznie zostanie odkuta płytka lub rozkuta posadzka.": "After verifying the system with a manometer and preliminary identifying the location, it is the geophone (and tracer gas) that is used to indicate the exact spot of 10-20 cm where the tile or floor will ultimately be broken.",
    "Gaz znacznikowy (H2/N2) i detektor": "Tracer gas (H2/N2) and detector",
    "Metoda gazowa to również technologia <strong>bezpośredniej i ostatecznej, bardzo precyzyjnej lokalizacji</strong> usterki. Stosowana najczęściej przy wyciekach \"niesłyszalnych\" dla geofonu (bardzo małe ubytki, instalacje podgrzewane w grubym betonie).": "The gas method is also a technology for <strong>direct and final, very precise location</strong> of the fault. Most often used for leaks that are \"inaudible\" to the geophone (very small leaks, heated installations in thick concrete).",
    "Instalacja jest nabijana gazem, a nasz niezwykle czuły detektor namierza cząsteczki wodoru, które ulatniają się z miejsca awarii prosto w górę przez materiały budowlane.": "The installation is filled with gas, and our highly sensitive detector tracks hydrogen particles that escape from the fault straight up through the building materials.",
    "BADANIE WSTĘPNE": "PRELIMINARY TESTING",
    "Kamera termowizyjna HD": "HD Thermal Camera",
    "Kamery termowizyjne służą do wstępnej oceny obszaru roboczego i bezinwazyjnego mapowania rozkładu temperatur pod posadzką lub wewnątrz ścian.": "Thermal imaging cameras are used for preliminary assessment of the working area and non-invasive mapping of temperature distribution under the floor or inside walls.",
    "Doskonale sprawdzają się na etapie typowania głównych stref występowania problemu, zwłaszcza przy awariach ogrzewania podłogowego oraz wyciekach gorącej wody. Pozwalają zawęzić teren poszukiwań przed przystąpieniem do precyzyjnych pomiarów.": "They are perfectly suited for identifying the main zones where the problem occurs, especially in underfloor heating failures and hot water leaks. They help narrow down the search area before precise measurements.",
    "LOKALIZACJA WEWNĘTRZNA / KANALIZACJA": "INTERNAL LOCATION / SEWAGE",
    "Specjalistyczny Barwnik UV": "Specialized UV Dye",
    "Stosujemy barwniki fluorescencyjne UV do badania szczelności skomplikowanych układów odpływowych, nieszczelnych hydroizolacji, tarasów i dachów płaskich.": "We use UV fluorescent dyes to test the tightness of complex drainage systems, leaking waterproofing, terraces and flat roofs.",
    "Wprowadzona zabarwiona woda po jakimś czasie przenika przez uszkodzone miejsca hydroizolacji czy fug, a podświetlenie latarką UV bezbłędnie demaskuje trasę, którą podąża woda wywołująca przeciek.": "The introduced dyed water eventually penetrates through damaged areas of waterproofing or grout, and illuminating it with a UV flashlight flawlessly reveals the path taken by the water causing the leak.",
    "BADANIE WSTĘPNE / INSPEKCJA": "PRELIMINARY TESTING / INSPECTION",
    "Endoskopy i kamery inspekcyjne": "Endoscopes and inspection cameras",
    "Kamera inspekcyjna to \"oczy\" fachowca wszędzie tam, gdzie nie ma fizycznego dostępu: w szachtach, obudowach wanien, wnętrzach rur czy pod wannami z hydromasażem.": "An inspection camera acts as the \"eyes\" of the professional wherever there is no physical access: in shafts, bathtub enclosures, inside pipes or under hot tubs.",
    "Obraz na żywo pozwala zbadać podejrzane miejsca pod kątem wadliwych złączy, pęknięć czy rozszczelnień kanalizacji, bez konieczności niszczenia zabudowy g-k.": "Live view allows inspecting suspicious areas for faulty joints, cracks, or sewage leaks, without the need to destroy drywall constructions.",
    "Mierniki wilgotności (Gann i Tramex)": "Moisture meters (Gann and Tramex)",
    "Używamy profesjonalnych, bezinwazyjnych wilgotnościomierzy znanych marek (Gann i Tramex), aby sporządzić mapę zawilgocenia materiałów budowlanych.": "We use professional, non-invasive moisture meters from renowned brands (Gann and Tramex) to map the moisture levels in building materials.",
    "Służą one do wstępnej oceny stanu zalania obiektu. Pomagają odróżnić suche fragmenty od tych nasyconych wodą, co pozwala nam podążać \"śladem wody\" aż do prawdopodobnego źródła przecieku.": "They serve for a preliminary assessment of the flooded property. They help distinguish dry fragments from those saturated with water, allowing us to follow the \"water trail\" right to the probable source of the leak.",
    "Próby ciśnieniowe to absolutna podstawa i pierwsze badanie, które wykonujemy po przyjeździe. Używając precyzyjnych manometrów i kompresora, sprawdzamy szczelność każdej z instalacji z osobna.": "Pressure tests are the absolute basis and the first test we perform upon arrival. Using precise manometers and a compressor, we check the tightness of each installation separately.",
    "Pozwala to w 100% jednoznacznie określić, w którym rurociągu jest wyciek: czy w instalacji wody zimnej, wody ciepłej (C.W.U.), czy też w obiegu centralnego ogrzewania (C.O.). To kluczowy etap oceny stanu, zanim rozpoczniemy dokładne namierzanie awarii.": "This allows us to determine 100% clearly which pipeline has a leak: whether in the cold water, hot water (C.W.U.), or central heating (C.O.) system. It is a crucial stage of assessing the condition before we start accurate fault tracking.",

    // FAQ
    "Często Zadawane Pytania (FAQ) — WyciekiPro": "Frequently Asked Questions (FAQ) — WyciekiPro",
    "Odpowiedzi na najczęstsze pytania dotyczące lokalizacji wycieków wody. Dowiedz się o ubezpieczeniu, bezinwazyjności i kosztach badania.": "Answers to the most frequent questions about water leak detection. Learn about insurance, non-invasive methods, and inspection costs.",
    "Często Zadawane Pytania (FAQ)": "Frequently Asked Questions (FAQ)",
    "Znajdź szybkie odpowiedzi na najczęstsze pytania formalne i techniczne dotyczące lokalizacji wycieków wody.": "Find quick answers to common formal and technical questions regarding water leak detection.",
    "Czy lokalizacja wycieku wody jest bezinwazyjna?": "Is water leak detection non-invasive?",
    "Tak, wszystkie nasze badania diagnostyczne przeprowadzamy w sposób w pełni bezinwazyjny. Wykorzystujemy zaawansowane metody akustyczne (geofon), gaz znacznikowy (mieszankę wodoru i azotu) oraz profesjonalną termowizję.": "Yes, all our diagnostic tests are performed completely non-invasively. We use advanced acoustic methods (geophone), tracer gas (a mixture of hydrogen and nitrogen), and professional thermal imaging.",
    "Dzięki temu zazwyczaj jesteśmy w stanie precyzyjnie namierzyć nieszczelność pod posadzką lub w ścianach bez konieczności rozkuwania połowy domu. W większości przypadków kucie ogranicza się do jednego wskazanego punktu (najczęściej o wymiarach jednej lub dwóch płytek), co pozwala na sprawne i jak najmniej inwazyjne usunięcie usterki.": "Thanks to this, we are usually able to precisely locate a leak under the floor or in the walls without having to break half the house. In most cases, drilling is limited to one indicated point (usually the size of one or two tiles), which allows for efficient and least invasive fault repair.",
    "Czy po zlokalizowaniu wycieku pomagacie w osuszaniu budynku?": "Do you help with drying the building after locating the leak?",
    "Tak. Ściśle współpracujemy ze sprawdzonymi firmami zajmującymi się profesjonalnym osuszaniem po zalaniach. Pomagamy w szybkim zorganizowaniu sprzętu i rozpoczęciu procesu suszenia ścian oraz posadzek, co minimalizuje ryzyko rozwoju grzybów i pleśni.": "Yes. We work closely with trusted companies specializing in professional post-flood drying. We assist in quickly organizing equipment and starting the drying process for walls and floors, minimizing the risk of mold and fungi.",
    "Koszty osuszania, podobnie jak koszty lokalizacji wycieku, mogą zostać w pełni pokryte z Twojej polisy ubezpieczeniowej.": "Drying costs, just like the leak detection costs, can be fully covered by your insurance policy.",
    "Czy ubezpieczyciel pokrywa koszty lokalizacji wycieku?": "Does insurance cover the costs of leak detection?",
    "W zdecydowanej większości przypadków tak. Standardowe polisy ubezpieczeniowe mieszkań i domów (w ramach ryzyka zalania lub tzw. klauzuli „poszukiwania przyczyn awarii”) w pełni pokrywają koszty profesjonalnego wykrywania wycieków.": "In the vast majority of cases, yes. Standard home insurance policies (under flood risk or the 'fault finding clause') fully cover the costs of professional leak detection.",
    "Po zakończeniu naszych prac na obiekcie przygotowujemy kompletną dokumentację techniczną (oficjalny protokół z opisem usterki, wskazaniem lokalizacji, metodami badawczymi oraz zdjęciami diagnostycznymi) oraz wystawiamy fakturę VAT. Dokumenty te stanowią gotową podstawę do ubiegania się o pełen zwrot kosztów od ubezpieczyciela.": "Upon completing our work, we prepare complete technical documentation (official report describing the fault, indicating the location, research methods, and diagnostic photos) and issue a VAT invoice. These documents serve as a ready basis for claiming a full refund from the insurer.",
    "Ile czasu trwa namierzenie wycieku?": "How long does it take to locate a leak?",
    "Zazwyczaj cała diagnostyka i precyzyjne namierzenie nieszczelności zajmuje nam od 1 do 3 godzin na miejscu zlecenia. Dokładny czas zależy od wielkości budynku, stopnia skomplikowania instalacji wodnych oraz charakteru samego wycieku (mikrowycieki wymagają dłuższego czasu i wyższych ciśnień próbnych).": "Usually, the entire diagnostic process and precise pinpointing of the leak takes us from 1 to 3 hours on site. The exact time depends on the size of the building, the complexity of water installations, and the nature of the leak itself (micro-leaks require more time and higher test pressures).",
    "Wszystkie niezbędne urządzenia diagnostyczne (manometry, sprężarki, kompresory, butle z gazem, geofony, kamery termowizyjne i endoskopy) posiadamy zawsze na jednym aucie, co pozwala nam w ponad 95% przypadków zlokalizować usterkę podczas pierwszej wizyty.": "We always carry all necessary diagnostic equipment (manometers, compressors, gas cylinders, geophones, thermal imaging cameras, and endoscopes) in one vehicle, allowing us to locate the fault during the first visit in over 95% of cases.",
    "Jakie instalacje jesteście w stanie sprawdzić?": "What installations can you inspect?",
    "Wykonujemy kompleksowe pomiary szczelności dla każdego rodzaju instalacji w budynkach mieszkalnych i komercyjnych:": "We perform comprehensive leak tests for every type of installation in residential and commercial buildings:",
    "• Instalacje wody użytkowej (ciepła woda użytkowa C.W.U. oraz zimna woda Z.W.U.)": "• Domestic water installations (hot water and cold water)",
    "• Instalacje centralnego ogrzewania (C.O. — zarówno grzejnikowe, jak i wodne ogrzewanie podłogowe)": "• Central heating installations (C.H. — both radiators and hydronic underfloor heating)",
    "• Podejścia i piony kanalizacyjne (przy użyciu specjalistycznych kamer inspekcyjnych i barwników UV)": "• Sewage lines and risers (using specialized inspection cameras and UV dyes)",
    "• Badanie szczelności hydroizolacji tarasów, balkonów oraz dachów płaskich metodą prób barwnikowych.": "• Testing the waterproofing of terraces, balconies, and flat roofs using dye tests.",
    "Jak należy przygotować się do Państwa wizyty?": "How should I prepare for your visit?",
    "Aby diagnostyka przebiegła sprawnie i szybko, prosimy o zadbanie o kilka szczegółów przed naszym przyjazdem:": "To ensure smooth and quick diagnostics, please take care of a few details before our arrival:",
    "1. **Dostęp do instalacji**: Prosimy o uprzątnięcie i ułatwienie dostępu do głównych zaworów odcinających wodę, rozdzielaczy ogrzewania, wodomierza oraz kotła grzewczego.": "1. **Access to installations**: Please clear the area and provide easy access to the main water shut-off valves, heating manifolds, water meter, and boiler.",
    "2. **Wyłączenie ogrzewania**: W przypadku podejrzeń wycieku z ogrzewania podłogowego lub C.O. zalecamy wyłączenie ogrzewania na około 1-2 godziny przed wizytą. Pozwoli to na ostygnięcie posadzki, co jest niezbędne do uzyskania czytelnego i wyraźnego obrazu z kamery termowizyjnej po ponownym uruchomieniu instalacji.": "2. **Turn off heating**: For suspected underfloor or central heating leaks, we recommend turning off the heating 1-2 hours before our visit. This cools the floor, which is essential to get a clear thermal image once the system is restarted.",
    "3. **Dostępność**: Prosimy o obecność na miejscu osoby decyzyjnej, która zna historię instalacji i może wskazać, gdzie pojawiały się pierwsze objawy wilgoci.": "3. **Availability**: Please ensure a decision-maker is present who knows the installation's history and can point out where the first signs of moisture appeared.",
    "Czy naprawiacie Państwo wykryte wycieki?": "Do you repair the detected leaks?",
    "W wielu przypadkach tak. Jeśli lokalizacja wycieku na to pozwala i uszkodzenie jest punktowe (np. pęknięta złączka, niewielka nieszczelność w rurze miedzianej, zgrzewanej czy obwodzie ogrzewania podłogowego), staramy się usunąć usterkę od razu po jej zlokalizowaniu. Należy jednak pamiętać, że naprawa jest usługą dodatkową i zależy od warunków technicznych oraz dostępności miejsca awarii.": "In many cases, yes. If the location allows and the damage is pinpoint (e.g. cracked fitting, small leak in a copper, welded pipe, or heating circuit), we try to repair the fault immediately after locating it. Note that repair is an additional service and depends on technical conditions and accessibility.",
    "W przypadku skomplikowanych awarii wymagających gruntownej modernizacji instalacji, przekazujemy dokładne wytyczne oraz polecamy zaufanych, lokalnych hydraulików.": "For complex failures requiring major installation modernization, we provide detailed guidelines and recommend trusted local plumbers.",
    "Jak mogę samodzielnie sprawdzić, czy w moim domu jest wyciek wody?": "How can I check myself if there is a water leak in my house?",
    "Istnieje kilka sygnałów ostrzegawczych, na które warto zwrócić uwagę:": "There are several warning signs to look out for:",
    "1. **Spadek ciśnienia w kotle C.O.**: Jeśli musisz regularnie dopuszczać wodę do układu grzewczego, najprawdopodobniej w instalacji występuje nieszczelność.": "1. **Pressure drop in the boiler**: If you have to regularly refill the heating system with water, there is likely a leak.",
    "2. **Ruch wodomierza**: Zakręć wszystkie kany, wyłącz pralkę i zmywarkę, a następnie sprawdź tarczę licznikową. Jeśli wskaźnik nadal się obraca lub cyfry rosną, woda ucieka w sposób niekontrolowany.": "2. **Water meter movement**: Close all taps, turn off the washing machine and dishwasher, and then check the meter dial. If the indicator is still moving or digits increase, water is escaping uncontrollably.",
    "3. **Wilgoć i zapach stęchlizny**: Pojawienie się plam na ścianach lub sufitach, odklejanie się tapet, wybrzuszenia farby oraz specyficzny zapach wilgoci to jasny sygnał alarmowy.": "3. **Moisture and musty smell**: Spots on walls or ceilings, peeling wallpaper, bubbling paint, and a distinct damp smell are clear warning signs.",
    "4. **Szum w rurach**: Cichy, jednostajny szum wody słyszalny w nocy, gdy nikt nie korzysta z instalacji, często oznacza pękniętą rurę.": "4. **Noise in pipes**: A quiet, steady hissing sound of water heard at night when no one is using the installation often means a cracked pipe.",
    "Czy lokalizujecie wycieki na zewnątrz budynków (np. w ogrodzie, na przyłączu)?": "Do you detect leaks outside buildings (e.g. in the garden, at the connection)?",
    "Tak, wykonujemy również lokalizację wycieków na zewnętrznych instalacjach, takich jak przyłącza wodociągowe do budynków, instalacje nawadniania ogrodów czy rury biegnące pod kostką brukową lub trawnikiem. Wykorzystujemy do tego zaawansowaną metodę gazu znacznikowego oraz nasłuch geofonem.": "Yes, we also locate leaks on outdoor installations, such as water connections to buildings, garden irrigation systems, or pipes running under paving stones or lawns. We use advanced tracer gas methods and geophone listening for this.",
    "Należy jednak pamiętać, że diagnostyka na zewnątrz jest mocno zależna od warunków atmosferycznych (np. intensywne opady deszczu lub silny wiatr mogą utrudnić pomiary) oraz głębokości posadowienia rur.": "Keep in mind that outdoor diagnostics heavily depend on weather conditions (e.g. heavy rain or strong winds can hinder measurements) and the depth of the pipes.",
    "Co należy zrobić natychmiast po zauważeniu zalania?": "What should be done immediately after noticing flooding?",
    "Szybkie i przemyślane działanie pozwala zminimalizować straty oraz ułatwić procedurę odszkodowawczą:": "Quick and thoughtful action minimizes losses and facilitates the compensation procedure:",
    "1. **Zakręć główny zawór**: Odetnij dopływ wody do budynku lub mieszkania (zazwyczaj znajduje się przy wodomierzu).": "1. **Close the main valve**: Shut off the water supply to the building or apartment (usually near the water meter).",
    "2. **Wyłącz urządzenia elektryczne**: Jeśli woda zalewa gniazdka lub przewody, bezpiecznie odłącz zasilanie w skrzynce bezpiecznikowej.": "2. **Turn off electrical devices**: If water is flooding sockets or wires, safely disconnect the power at the fuse box.",
    "3. **Wykonaj dokumentację**: Zrób zdjęcia i nagraj krótkie filmy pokazujące świeże plamy, zacieki oraz zniszczone mienie. Będzie to kluczowy dowód dla ubezpieczyciela.": "3. **Document the damage**: Take photos and record short videos showing fresh spots, stains, and damaged property. This will be crucial evidence for the insurer.",
    "4. **Wezwij specjalistów**: Skontaktuj się z nami pod numerem **+48 793 499 678**. Wskazanie dokładnego miejsca wycieku zapobiegnie chaotycznemu i kosztownemu kuciu ścian na ślepo.": "4. **Call specialists**: Contact us at **+48 793 499 678**. Accurately pinpointing the leak will prevent chaotic and costly blind wall demolition.",
    "Czy sprawdzacie również szczelność instalacji kanalizacyjnej?": "Do you also check the tightness of the sewage system?",
    "Tak, ponieważ za wilgoć i zacieki na ścianach bardzo często odpowiada nie instalacja ciśnieniowa, lecz nieszczelna kanalizacja. Do badania rur odpływowych i pionów kanalizacyjnych wykorzystujemy specjalistyczne, elastyczne kamery inspekcyjne (endoskopy) oraz próby barwnikowe z użyciem bezpiecznych dla środowiska barwników fluorescencyjnych, które świecą w świetle UV. Pozwala to na precyzyjne zlokalizowanie pęknięć, rozszczelnień na łączeniach (uszczelkach) czy zatorów.": "Yes, because moisture and wall stains are often caused by a leaking sewage system rather than a pressurized one. To test drain pipes and sewage risers, we use specialized flexible inspection cameras (endoscopes) and dye tests using eco-friendly fluorescent dyes that glow under UV light. This allows for precise localization of cracks, joint leaks (gaskets), or blockages.",
    "Masz inne pytanie?": "Have another question?",
    "Jeśli nie znalazłeś odpowiedzi na swoje pytania, skontaktuj się z nami bezpośrednio. Wyjaśnimy wszelkie szczegóły techniczne i formalne.": "If you didn't find the answers to your questions, contact us directly. We will explain all technical and formal details.",
    
    // Galeria
    "Galeria — WyciekiPro": "Gallery — WyciekiPro",
    "Zobacz zdjęcia z naszych realizacji. Profesjonalne wykrywanie wycieków wody w praktyce.": "See photos from our completed projects. Professional water leak detection in practice.",
    "Galeria": "Gallery",
    "Galeria Realizacji": "Project Gallery",
    "Zobacz, jak w praktyce wygląda nasza praca przy wykorzystaniu specjalistycznego sprzętu diagnostycznego.": "See what our work looks like in practice using specialized diagnostic equipment.",
    "Profesjonalna lokalizacja": "Professional detection",
    "Pęknięty trójnik": "Cracked tee",
    "Wyciek w ścianie": "Leak inside the wall",
    "Skuteczne wykrywanie": "Effective detection",
    "Lokalizacja gazem": "Gas detection",
    "Inspekcja kanalizacji": "Sewage inspection",
    "Kamera termowizyjna": "Thermal imaging camera",
    "Test barwnikowy": "Dye test",
    "Lokalizacja pod posadzką": "Detection under floor",
    "Precyzyjne kucie": "Precise demolition",
    "Wyciek z CO": "Central heating leak",
    "Dokładne wskazanie": "Precise indication",
    "Sprawdzenie uszczelek": "Checking gaskets"
};

FILES.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

    for (const pl of sortedKeys) {
        const en = dict[pl];
        // Create a regex that allows any amount of whitespace (including newlines) between words
        const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regexStr = pl.split(/\s+/).map(escapeRegExp).join('\\s+');
        const regex = new RegExp(regexStr, 'g');
        content = content.replace(regex, en);
    }
    fs.writeFileSync(file, content, 'utf-8');
});

console.log("Internal pages translated successfully!");
