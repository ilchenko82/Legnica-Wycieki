const fs = require('fs');

const FILES = ['en/index.html', 'en/cennik.html', 'en/uslugi.html', 'en/sprzet.html', 'en/galeria.html', 'en/faq.html'];

const dict = {
    // Nav Menu
    "Cennik": "Pricing",
    "Usługi": "Services",
    "Sprzęt": "Equipment",
    "O nas": "About Us",
    "Galeria": "Gallery",
    "Kontakt": "Contact",

    // Common Elements
    "Zadzwoń": "Call",
    "WyciekiPro — Profesjonalne Wykrywanie Wycieków Wody": "WyciekiPro — Professional Water Leak Detection",
    "Profesjonalne wykrywanie wycieków wody w Warszawie i całej Polsce. Nowoczesny sprzęt, szybka reakcja, bezinwazyjne metody. Zadzwoń teraz!": "Professional water leak detection in Warsaw and across Poland. Modern equipment, fast response, non-invasive methods. Call now!",
    "Warszawa i cała Polska (wycena dojazdu)": "Warsaw & All Poland (travel costs apply)",
    "Pon-Pt: 7-20, Sob: 8-16": "Mon-Fri: 7-20, Sat: 8-16",
    "Godziny pracy": "Working Hours",
    "Zostaw Zgłoszenie": "Send Request",
    "Obszar działania": "Service Area",
    "Telefon (7-23)": "Phone (7-23)",
    "Zostaw zgłoszenie": "Leave a Request",
    "Oddzwonimy w ciągu 30 minut": "We'll call you back within 30 minutes",
    "Imię": "Name",
    "Miasto / miejscowość": "City / Town",
    "Krótki opis problemu (opcjonalnie)": "Brief description of the problem (optional)",
    "Wygodny sposób kontaktu:": "Preferred contact method:",
    "Wyślij Zgłoszenie": "Send Request",
    "Wyślij": "Send",
    "Pokaż całą galerię": "View Full Gallery",
    "Wycieki z rur": "Pipe Leaks",
    "Ogrzewanie podłogowe": "Underfloor Heating",
    "Dachy i tarasy": "Roofs and Terraces",
    "Baseny": "Swimming Pools",
    "Firma": "Company",
    "Jak działamy": "How we work",
    "Opinie": "Reviews",
    "Warszawa, Polska": "Warsaw, Poland",
    "(Działamy w całym kraju)": "(Operating nationwide)",
    "© 2026 WyciekiPro. Wszelkie prawa zastrzeżone.": "© 2026 WyciekiPro. All rights reserved.",
    "Polityka prywatności": "Privacy Policy",
    
    // index.html specific
    "Dostępni 7-23 · WhatsApp": "Available 7-23 · WhatsApp",
    "Szybka i precyzyjna": "Fast and precise",
    "lokalizacja wycieków": "leak detection",
    "Nowoczesny sprzęt diagnostyczny i dokładne wskazanie wycieku bez zbędnego kucia.": "Modern diagnostic equipment and accurate leak detection without unnecessary demolition.",
    "Zapewniamy również pełne wsparcie w <strong>profesjonalnym osuszaniu</strong> po zalaniu.": "We also provide full support in <strong>professional drying</strong> after flooding.",
    "Zadzwoń Teraz": "Call Now",
    "Wykrytych wycieków": "Leaks Detected",
    "Lat doświadczenia": "Years of Experience",
    "Skuteczność": "Success Rate",
    "Cennik Usług": "Pricing",
    "Cena zależy od rodzaju i wielkości obiektu — bez ukrytych kosztów": "The price depends on the type and size of the property — no hidden costs",
    "Mieszkania": "Apartments",
    "Cena poszukiwania w mieszkaniach i kawalerkach.": "Price for leak detection in apartments and studios.",
    "od 1 300 zł": "from 1 300 PLN",
    "od 1 500 zł": "from 1 500 PLN",
    "od 400 zł": "from 400 PLN",
    "brutto": "gross",
    "Umów wizytę": "Book a visit",
    "Domy / komercja": "Houses / Commercial",
    "Cena poszukiwania w domach, bliźniakach, biurach i innej komercji.": "Price for leak detection in houses, semi-detached houses, offices and commercial buildings.",
    "Naprawa": "Repair",
    "Jeśli warunki techniczne na to pozwolą, postaramy się usunąć usterkę i dokonać naprawy od ręki.": "If technical conditions permit, we will try to fix the fault and make repairs on the spot.",
    "Dokładna wycena po krótkiej konsultacji telefonicznej — zadzwoń lub zostaw zgłoszenie.": "Accurate pricing after a short phone consultation — call or leave a request.",
    "Szczegóły cennika i rozliczeń": "Pricing & Billing Details",
    "Dlaczego klienci wybierają nas": "Why clients choose us",
    "Szybki dojazd": "Fast Response",
    "Baza w Warszawie, ale dojeżdżamy do klientów na terenie całej Polski.": "Based in Warsaw, but we travel to clients throughout Poland.",
    "Precyzyjna lokalizacja": "Precise Detection",
    "Dokładne wskazanie miejsca wycieku przy użyciu specjalistycznego sprzętu.": "Accurate pinpointing of the leak using specialized equipment.",
    "Minimalizacja zbędnego kucia": "Minimal Demolition",
    "Lokalizacja pozwala uniknąć niepotrzebnych wyburzeń i uszkodzeń.": "Detection helps avoid unnecessary demolition and damage.",
    "Raport dla ubezpieczyciela": "Insurance Report",
    "Dokumentacja pomocna przy zgłoszeniu szkody: protokół, zdjęcia i wideo.": "Documentation helpful for filing a claim: report, photos, and videos.",
    "Rozliczenie z ubezpieczenia i wsparcie w osuszaniu po zalaniu.": "Insurance billing and flood drying support.",
    "Koszty lokalizacji oraz osuszania możesz rozliczyć w ramach swojej polisy (m.in. PZU, Warta). Wystawiamy profesjonalny protokół z dokumentacją zdjęciową i współpracujemy ze sprawdzonymi firmami osuszającymi, pomagając Ci szybko przywrócić dom do normy.": "Leak detection and drying costs can be covered by your insurance policy. We issue a professional report with photo documentation and cooperate with trusted drying companies, helping you quickly restore your home to normal.",
    "Rodzaje Wycieków": "Types of Leaks",
    "Specjalizujemy się w wykrywaniu wszystkich typów wycieków wody": "We specialize in detecting all types of water leaks",
    "Lokalizacja uszkodzeń w instalacjach wodnych i kanalizacyjnych pod podłogą i w ścianach.": "Detecting faults in water and sewage systems under the floor and inside walls.",
    "Precyzyjne wykrywanie nieszczelności w systemach ogrzewania podłogowego.": "Precise detection of leaks in underfloor heating systems.",
    "Identyfikacja miejsc przecieków wody przez dachy płaskie, tarasy i balkony.": "Identifying leaks through flat roofs, terraces, and balconies.",
    "Kanalizacja": "Sewage",
    "Wykrywamy nieszczelności rur kanalizacyjnych, pionów oraz rur ukrytych w podłogach.": "We detect leaks in sewage pipes, risers, and pipes hidden in floors.",
    "Wszystkie rodzaje wycieków": "All leak types",
    "Profesjonalny Sprzęt": "Professional Equipment",
    "Korzystamy z najnowocześniejszego sprzętu diagnostycznego": "We use state-of-the-art diagnostic equipment",
    "Geofon wysokoczuły": "Highly Sensitive Geophone",
    "Profesjonalny geofon elektroniczny Trubolab A-10T3 — wykrywa nawet najmniejsze wycieki przez beton, gips i grunt na głębokości do kilku metrów.": "Professional electronic geophone Trubolab A-10T3 — detects even the smallest leaks through concrete, plaster, and soil up to several meters deep.",
    "Kamera termowizyjna i wilgotnościomierz": "Thermal Camera & Moisture Meter",
    "Wykrywanie różnic temperatury oraz pomiar stopnia zawilgocenia, wskazujących na obecność wycieków za ścianami i w posadzkach.": "Detecting temperature differences and measuring moisture levels to locate leaks behind walls and in floors.",
    "Endoskopy inspekcyjne": "Inspection Endoscopes",
    "Przemysłowe kamery do przeglądu rur, zabudów i trudno dostępnych przestrzeni. Posiadamy kilka różnych kamer do tego celu. Obraz HD.": "Industrial cameras for inspecting pipes, enclosures, and hard-to-reach areas. We have several different cameras for this purpose. HD imaging.",
    "Gaz znacznikowy i czujnik": "Tracer Gas & Sensor",
    "Wprowadzamy bezpieczną mieszankę H2/N2, którą po uwolnieniu wyłapujemy specjalistycznym, czułym detektorem gazu.": "We introduce a safe H2/N2 mixture, which we then detect with a specialized, highly sensitive gas detector upon release.",
    "Poznaj nasz pełny sprzęt": "View all our equipment",
    "Jak Szukamy Wycieków": "How We Find Leaks",
    "Sprawdzony 4-etapowy proces gwarantujący skuteczność": "A proven 4-step process ensuring effectiveness",
    "Dzwonisz lub wysyłasz formularz. Wyjaśniamy detale problemu i umawiamy termin wizyty.": "Call us or submit the form. We discuss the details of the problem and schedule a visit.",
    "Diagnostyka": "Diagnostics",
    "Przyjeżdżamy ze sprzętem i wykonujemy szczegółową diagnostykę.": "We arrive with our equipment and perform detailed diagnostics.",
    "Lokalizacja": "Detection",
    "Precyzyjnie wskazujemy miejsce wycieku z dokładnością od 10 do 40 cm. Wykonujemy miejscowe kucie, aby odkryć miejsce wycieku.": "We precisely pinpoint the leak with an accuracy of 10 to 40 cm. We perform localized drilling to expose the leak.",
    "W niektórych przypadkach możemy od razu wykonać usunięcie wycieku i naprawić usterkę.": "In some cases, we can immediately remove the leak and repair the fault.",
    "Protokół i faktura": "Report and Invoice",
    "Wystawiamy fakturę i protokół з dokumentacją zdjęciową, niezbędne do zgłoszenia szkody ubezpieczycielowi.": "We issue an invoice and a report with photo documentation, necessary for filing an insurance claim.",
    "Dokładna diagnoza. Konkretne rozwiązanie.": "Accurate diagnosis. Concrete solution.",
    "Od ponad 10 lat zajmuję się lokalizacją wycieków oraz diagnostyką instalacji wodnych i grzewczych. Stawiam na precyzyjną diagnostykę i konkretne wskazanie miejsca problemu — bez działania na ślepo i niepotrzebnej demolki.": "For over 10 years, I have been locating leaks and diagnosing water and heating systems. I focus on precise diagnostics and accurately pinpointing the problem area — without acting blindly or causing unnecessary demolition.",
    "Twój specjalista — Sławek": "Your specialist — Sławek",
    "Galeria Realizacji": "Project Gallery",
    "Zdjęcia z naszych prac w terenie": "Photos from our field work",
    "Profesjonalna lokalizacja wycieków": "Professional leak detection",
    "Profesjonalna lokalizacja": "Professional detection",
    "Pęknięty trójnik wyciek": "Cracked tee leak",
    "Pęknięty trójnik": "Cracked tee",
    "Wyciek w ścianie": "Leak inside the wall",
    "Skuteczne wykrywanie geofonem": "Effective detection with geophone",
    "Skuteczne wykrywanie": "Effective detection",
    "Opinie Klientów": "Customer Reviews",
    "Zaufało nam ponad 500 klientów w całej Polsce": "Trusted by over 500 clients across Poland",
    "na podstawie 127 opinii Google": "based on 127 Google reviews",
    "2 tygodnie temu": "2 weeks ago",
    "\"Szybka reakcja, profesjonalny sprzęt. Wyciek znaleziony w 30 minut! Polecam każdemu.\"": "\"Fast response, professional equipment. Leak found in 30 minutes! I recommend them to everyone.\"",
    "1 miesiąc temu": "1 month ago",
    "\"Mieliśmy wyciek w ogrzewaniu podłogowym. Pan z WyciekiPro znalazł go korelatorem bez kucia podłogi!\"": "\"We had a leak in the underfloor heating. The WyciekiPro specialist found it using a correlator without breaking the floor!\"",
    "3 tygodnie temu": "3 weeks ago",
    "\"Wspólnota zlecała im poszukiwanie wycieku w piwnicy. Bardzo profesjonalne podejście i protokół badań.\"": "\"The housing association hired them to find a leak in the basement. Very professional approach and testing report.\"",
    "Zadowolony z usługi?": "Satisfied with the service?",
    "Zostaw opinię na Google": "Leave a review on Google",
    "Zgłoś wyciek lub umów się na wizytę diagnostyczną": "Report a leak or schedule a diagnostic visit",
    "Profesjonalne wykrywanie wycieków wody z wykorzystaniem najnowocześniejszego sprzętu akustycznego i termowizyjnego.": "Professional water leak detection using state-of-the-art acoustic and thermal imaging equipment."
};

FILES.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    
    // First translate <html lang="pl"> to <html lang="en">
    content = content.replace(/<html lang="pl">/g, '<html lang="en">');

    // Sort keys by length descending to prevent partial replacements
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

console.log("Base translation script applied to all files.");
