# Script: update_subpages_llmo.ps1
# Updates all subpages with og:site_name, twitter:card, and WebPage JSON-LD schema
# Uses ASCII-safe page names to avoid encoding issues with em-dashes in PowerShell

$root = "g:\pracownia\wyciekipro"
# Override root to actual path
$root = Split-Path -Parent $PSScriptRoot

$pages = @(
    [PSCustomObject]@{
        file = "cennik.html"
        url  = "https://wyciekipro.pl/cennik.html"
        name = "Cennik Wykrywania Wyciekow - WyciekiPro"
        desc = "Ile kosztuje wykrywanie wycieku? Sprawdz ceny uslug dla mieszkan, domow i firm. Bezinwazyjna diagnostyka od 300 zl."
        lang = "pl"
    }
    [PSCustomObject]@{
        file = "uslugi.html"
        url  = "https://wyciekipro.pl/uslugi.html"
        name = "Uslugi Wykrywania Wyciekow - WyciekiPro"
        desc = "Lokalizacja wyciekow z rur, ogrzewania podlogowego, dachow i kanalizacji. Precyzyjna diagnostyka, bezinwazyjne metody."
        lang = "pl"
    }
    [PSCustomObject]@{
        file = "sprzet.html"
        url  = "https://wyciekipro.pl/sprzet.html"
        name = "Sprzet do Wykrywania Wyciekow - WyciekiPro"
        desc = "Geofony, kamery termowizyjne, detektory gazu i endoskopy. Sprawdz, jakim sprzetem wykrywamy wycieki."
        lang = "pl"
    }
    [PSCustomObject]@{
        file = "faq.html"
        url  = "https://wyciekipro.pl/faq.html"
        name = "FAQ - Czesto Zadawane Pytania - WyciekiPro"
        desc = "Odpowiedzi na najczestsze pytania o wykrywanie wyciekow wody. Ubezpieczenie, koszty, metody bezinwazyjne."
        lang = "pl"
    }
    [PSCustomObject]@{
        file = "galeria.html"
        url  = "https://wyciekipro.pl/galeria.html"
        name = "Galeria Realizacji - WyciekiPro"
        desc = "Zdjecia z naszych prac: lokalizacja wyciekow wody, badanie termowizyjne, lokalizacja gazem znacznikowym."
        lang = "pl"
    }
    [PSCustomObject]@{
        file = "en\cennik.html"
        url  = "https://wyciekipro.pl/en/cennik.html"
        name = "Leak Detection Pricing - WyciekiPro"
        desc = "How much does leak detection cost? Pricing for apartments, houses and businesses. Non-invasive diagnostics from PLN 300."
        lang = "en"
    }
    [PSCustomObject]@{
        file = "en\uslugi.html"
        url  = "https://wyciekipro.pl/en/uslugi.html"
        name = "Water Leak Detection Services - WyciekiPro"
        desc = "Pipe leak location, underfloor heating, roof and sewage diagnostics. Precise, non-invasive methods."
        lang = "en"
    }
    [PSCustomObject]@{
        file = "en\sprzet.html"
        url  = "https://wyciekipro.pl/en/sprzet.html"
        name = "Leak Detection Equipment - WyciekiPro"
        desc = "Geophones, thermal imaging cameras, gas detectors and endoscopes. See how we detect leaks."
        lang = "en"
    }
    [PSCustomObject]@{
        file = "en\faq.html"
        url  = "https://wyciekipro.pl/en/faq.html"
        name = "FAQ - Frequently Asked Questions - WyciekiPro"
        desc = "Answers to the most common questions about water leak detection. Insurance, costs, non-invasive methods."
        lang = "en"
    }
    [PSCustomObject]@{
        file = "en\galeria.html"
        url  = "https://wyciekipro.pl/en/galeria.html"
        name = "Project Gallery - WyciekiPro"
        desc = "Photos from our field work: professional water leak detection, thermal imaging, tracer gas location."
        lang = "en"
    }
)

foreach ($page in $pages) {
    $path = Join-Path $root $page.file
    if (-not (Test-Path $path)) {
        Write-Host "SKIP (not found): $path"
        continue
    }

    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

    # 1. Add og:site_name and twitter:card after og:image line
    if ($content -notmatch 'og:site_name') {
        $ogImagePattern = '(<meta property="og:image"[^\r\n]*[\r\n]+)'
        $replacement = '$1  <meta property="og:site_name" content="WyciekiPro">' + "`r`n" + '  <meta name="twitter:card" content="summary_large_image">' + "`r`n"
        $content = [regex]::Replace($content, $ogImagePattern, $replacement)
        Write-Host "  + og:site_name added to $($page.file)"
    } else {
        Write-Host "  ~ og:site_name already present in $($page.file)"
    }

    # 2. Add WebPage JSON-LD before </head>
    if ($content -notmatch '"@type": "WebPage"') {
        $schema = @"

  <!-- WebPage Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "$($page.url)#webpage",
    "url": "$($page.url)",
    "name": "$($page.name)",
    "description": "$($page.desc)",
    "inLanguage": "$($page.lang)",
    "datePublished": "2026-01-01",
    "dateModified": "2026-05-20"
  }
  </script>
"@
        $content = $content -replace '</head>', ($schema + "`n</head>")
        Write-Host "  + WebPage schema added to $($page.file)"
    } else {
        Write-Host "  ~ WebPage schema already present in $($page.file)"
    }

    [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
    Write-Host "SAVED: $($page.file)"
}

Write-Host "`nAll subpages processed."
