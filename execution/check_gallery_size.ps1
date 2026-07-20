Add-Type -AssemblyName System.Drawing
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrEmpty($scriptDir)) { $scriptDir = Get-Location }
$img = [System.Drawing.Image]::FromFile((Join-Path $scriptDir "..\images\gallery\profesjonalna-lokalizacja-wyciekow.jpg"))
Write-Host "Gallery size: $($img.Width) x $($img.Height)"
$img.Dispose()
