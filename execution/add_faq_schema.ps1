# add_faq_schema.ps1 - Adds FAQPage JSON-LD schema to faq.html and en/faq.html
$root = Split-Path -Parent $PSScriptRoot

# ===== PL FAQPage schema =====
$plSchema = @'

  <!-- FAQPage Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Czy lokalizacja wycieku wody jest bezinwazyjna?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak, wszystkie nasze badania diagnostyczne przeprowadzamy w sposob w pelni bezinwazyjny. Wykorzystujemy zaawansowane metody akustyczne (geofon), gaz znacznikowy oraz profesjonalna termowizje. W wiekszosci przypadkow kucie ogranicza sie do jednego wskazanego punktu."
        }
      },
      {
        "@type": "Question",
        "name": "Czy po zlokalizowaniu wycieku pomagacie w osuszaniu budynku?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak. Scisle wspolpracujemy ze sprawdzonymi firmami zajmujacymi sie profesjonalnym osuszaniem po zalaniach. Koszty osuszania moga zostac w pelni pokryte z polisy ubezpieczeniowej."
        }
      },
      {
        "@type": "Question",
        "name": "Czy ubezpieczyciel pokrywa koszty lokalizacji wycieku?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "W zdecydowanej wiekszosci przypadkow tak. Standardowe polisy ubezpieczeniowe mieszkan i domow w pelni pokrywaja koszty profesjonalnego wykrywania wyciekow. Po zakonczeniu prac przygotowujemy kompletna dokumentacje techniczna oraz wystawiamy fakture VAT."
        }
      },
      {
        "@type": "Question",
        "name": "Ile czasu trwa namierzenie wycieku?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Zazwyczaj cala diagnostyka i precyzyjne namierzenie nieszczelnosci zajmuje od 1 do 3 godzin na miejscu zlecenia. W ponad 95% przypadkow lokalizujemy usterke podczas pierwszej wizyty."
        }
      },
      {
        "@type": "Question",
        "name": "Jakie instalacje jestescie w stanie sprawdzic?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Wykonujemy kompleksowe pomiary szczelnosci: instalacje wody uzytkowej (C.W.U. i Z.W.U.), centralnego ogrzewania (C.O.), podejscia i piony kanalizacyjne, oraz badanie szczelnosci hydroizolacji tarasow, balkonow i dachow plaskich."
        }
      },
      {
        "@type": "Question",
        "name": "Jak nalezy przygotowac sie do Panstwa wizyty?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Prosimy o dostep do glownych zaworow odcinajacych wode, rozdzielaczy ogrzewania, wodomierza i kotla. W przypadku podejrzen wycieku z ogrzewania podlogowego zalecamy wylaczenie ogrzewania na 1-2 godziny przed wizyta. Prosimy o obecnosc osoby decyzyjnej."
        }
      },
      {
        "@type": "Question",
        "name": "Czy naprawiacie wykryte wycieki?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "W wielu przypadkach tak. Jesli uszkodzenie jest punktowe (np. peknieta zlaczka, niewielka nieszczelnosc), staramy sie usunac usterke od razu. W przypadku skomplikowanych awarii polecamy zaufanych hydraulikow."
        }
      },
      {
        "@type": "Question",
        "name": "Jak moge samodzielnie sprawdzic, czy w moim domu jest wyciek wody?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sygnaly ostrzegawcze: spadek cisnienia w kotle C.O., ruch wodomierza przy zakreconych kranach, wilgoc i zapach stechlizny na scianach, szum w rurach slyszalny w nocy."
        }
      },
      {
        "@type": "Question",
        "name": "Czy lokalizujecie wycieki na zewnatrz budynkow?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak, wykonujemy lokalizacje wyciekow na zewnetrznych instalacjach: przylacza wodociagowe, instalacje nawadniania ogrodow, rury pod kostka brukowa. Wykorzystujemy metode gazu znacznikowego oraz nasluch geofonem."
        }
      },
      {
        "@type": "Question",
        "name": "Co nalezy zrobic natychmiast po zauwazeniu zalania?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "1) Zakrec glowny zawor wody. 2) Wylacz urzadzenia elektryczne jesli woda zalewa gniazdka. 3) Zrob zdjecia i filmy jako dowod dla ubezpieczyciela. 4) Skontaktuj sie z nami pod numerem +48 793 499 678."
        }
      },
      {
        "@type": "Question",
        "name": "Czy sprawdzacie szczelnosc instalacji kanalizacyjnej?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak, do badania rur odplywowych i pionow kanalizacyjnych wykorzystujemy kamery inspekcyjne (endoskopy) oraz proby barwnikowe z uzyciem bezpiecznych dla srodowiska barwnikow fluorescencyjnych swieccych w swietle UV."
        }
      }
    ]
  }
  </script>
'@

# ===== EN FAQPage schema =====
$enSchema = @'

  <!-- FAQPage Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is water leak detection non-invasive?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all our diagnostic tests are fully non-invasive. We use advanced acoustic methods (geophone), tracer gas and professional thermal imaging. In most cases, drilling is limited to a single indicated point."
        }
      },
      {
        "@type": "Question",
        "name": "Do you help with building drying after locating the leak?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. We closely cooperate with trusted companies specializing in professional drying after floods. Drying costs can be fully covered by your insurance policy."
        }
      },
      {
        "@type": "Question",
        "name": "Does insurance cover leak detection costs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In the vast majority of cases, yes. Standard home insurance policies fully cover professional leak detection costs. We provide complete technical documentation and a VAT invoice."
        }
      },
      {
        "@type": "Question",
        "name": "How long does it take to locate a leak?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Usually the full diagnostics and precise leak location takes 1 to 3 hours on site. In over 95% of cases, we locate the fault during the first visit."
        }
      },
      {
        "@type": "Question",
        "name": "What types of installations can you inspect?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We perform comprehensive leak tests: domestic water installations, central heating (including underfloor), sewage risers and drains, and waterproofing tests for terraces, balconies and flat roofs."
        }
      },
      {
        "@type": "Question",
        "name": "How should I prepare for your visit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Please ensure access to main water shut-off valves, heating manifolds, water meter and boiler. For underfloor heating leaks, turn off heating 1-2 hours before the visit. Please have a decision-maker present."
        }
      },
      {
        "@type": "Question",
        "name": "Do you repair detected leaks?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In many cases, yes. If the damage is localized (e.g., cracked fitting, small pipe leak), we try to fix it right away. For complex failures, we recommend trusted local plumbers."
        }
      },
      {
        "@type": "Question",
        "name": "How can I check for a water leak myself?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Warning signs: pressure drop in the heating boiler, water meter movement with all taps closed, moisture and musty smell on walls, water noise in pipes heard at night."
        }
      },
      {
        "@type": "Question",
        "name": "Do you locate leaks outside buildings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we locate leaks on external installations: water supply connections, garden irrigation systems, pipes under paving. We use tracer gas method and geophone listening."
        }
      },
      {
        "@type": "Question",
        "name": "What should I do immediately after noticing a flood?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "1) Shut off the main water valve. 2) Turn off electrical devices if water reaches sockets. 3) Take photos and videos as evidence for insurance. 4) Contact us at +48 793 499 678."
        }
      },
      {
        "@type": "Question",
        "name": "Do you check sewage installation tightness?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we use inspection cameras (endoscopes) and dye tests with eco-friendly fluorescent dyes that glow under UV light to precisely locate cracks and seal failures."
        }
      }
    ]
  }
  </script>
'@

# Add PL schema
$plPath = Join-Path $root "faq.html"
$plContent = [System.IO.File]::ReadAllText($plPath, [System.Text.Encoding]::UTF8)
if ($plContent -notmatch '"FAQPage"') {
    $plContent = $plContent -replace '</head>', ($plSchema + "`n</head>")
    [System.IO.File]::WriteAllText($plPath, $plContent, [System.Text.Encoding]::UTF8)
    Write-Host "ADDED FAQPage schema to faq.html"
} else {
    Write-Host "FAQPage schema already present in faq.html"
}

# Add EN schema
$enPath = Join-Path $root "en\faq.html"
$enContent = [System.IO.File]::ReadAllText($enPath, [System.Text.Encoding]::UTF8)
if ($enContent -notmatch '"FAQPage"') {
    $enContent = $enContent -replace '</head>', ($enSchema + "`n</head>")
    [System.IO.File]::WriteAllText($enPath, $enContent, [System.Text.Encoding]::UTF8)
    Write-Host "ADDED FAQPage schema to en/faq.html"
} else {
    Write-Host "FAQPage schema already present in en/faq.html"
}

Write-Host "Done."
