# update_footer_nav.ps1
$root = Split-Path -Parent $PSScriptRoot

$files = Get-ChildItem -Path $root -Filter "*.html" -File
$files += Get-ChildItem -Path (Join-Path $root "en") -Filter "*.html" -File

$ccPlBase64 = "PHAgc3R5bGU9Im1hcmdpbi10b3A6IDEycHg7IGZvbnQtc2l6ZTogMTFweDsgb3BhY2l0eTogMC43OyI+TWF0ZXJpYcOseSBuYSBzdHJvbmllIHPEhSBkb3N0xJlwbmUgbmEgbGljZW5jamkgPGEgaHJlZj0iaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzQuMC8iIHRhcmdldD0iX2JsYW5rIiByZWw9Im5vb3BlbmVyIiBzdHlsZT0iY29sb3I6ICNmZmY7IHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyI+Q3JlYXRpdmUgQ29tbW9ucyBDQyBCWSA0LjA8L2E+LjwvcD4="
$ccEnBase64 = "PHAgc3R5bGU9Im1hcmdpbi10b3A6IDEycHg7IGZvbnQtc2l6ZTogMTFweDsgb3BhY2l0eTogMC43OyI+U2l0ZSBtYXRlcmlhbHMgYXJlIGF2YWlsYWJsZSB1bmRlciB0aGUgPGEgaHJlZj0iaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzQuMC8iIHRhcmdldD0iX2JsYW5rIiByZWw9Im5vb3BlbmVyIiBzdHlsZT0iY29sb3I6ICNmZmY7IHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyI+Q3JlYXRpdmUgQ29tbW9ucyBDQyBCWSA0LjA8L2E+IGxpY2Vuc2UuPC9wPg=="

$ccPl = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($ccPlBase64))
$ccEn = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($ccEnBase64))

foreach ($fileInfo in $files) {
    $path = $fileInfo.FullName
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $modified = $false

    if ($content -match 'href="index\.html#process"') {
        $content = $content -replace 'href="index\.html#process"', 'href="about.html"'
        $modified = $true
    }
    if ($content -match 'href="#process"') {
        $content = $content -replace 'href="#process"', 'href="about.html"'
        $modified = $true
    }

    $isEnglish = $path -match '\\en\\'
    if ($isEnglish) {
        $ccText = $ccEn
    } else {
        $ccText = $ccPl
    }
    
    if ($content -notmatch 'Creative Commons CC BY 4.0') {
        $pattern2 = '(?s)(<div class="footer__bottom">.*?)(\s*</div>\s*</div>\s*</footer>)'
        if ($content -match $pattern2) {
            $content = $content -replace $pattern2, "`$1`n      $ccText`$2"
            $modified = $true
        } else {
            Write-Host "Warn: Could not match footer in $($fileInfo.Name)"
        }
    }

    if ($modified) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated $($fileInfo.Name)"
    }
}

Write-Host "Done."
