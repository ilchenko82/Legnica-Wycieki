Add-Type -AssemblyName System.Drawing

# Use PSScriptRoot to avoid encoding issues with cyrillic characters in absolute paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrEmpty($scriptDir)) {
    $scriptDir = Get-Location
}

$srcPath = Join-Path $scriptDir "..\images\hero\hero.jpg"
$outDir = Join-Path $scriptDir "..\images\hero"
$outPath = Join-Path $outDir "og-image.jpg"

# Ensure output directory exists
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

# Target OG image size
$targetW = 1200
$targetH = 630

# Load source image
if (-not (Test-Path $srcPath)) {
    Write-Error "Source file not found at: $srcPath"
    exit 1
}

$src = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Source size: $($src.Width) x $($src.Height)"

# Calculate crop region (center crop to 1200:630 aspect ratio)
$aspectTarget = $targetW / $targetH  # ~1.905

$srcAspect = $src.Width / $src.Height

if ($srcAspect -gt $aspectTarget) {
    # Source is wider - crop sides
    $cropH = $src.Height
    $cropW = [int]($cropH * $aspectTarget)
    $cropX = [int](($src.Width - $cropW) / 2)
    $cropY = 0
} else {
    # Source is taller - crop top/bottom
    $cropW = $src.Width
    $cropH = [int]($cropW / $aspectTarget)
    $cropX = 0
    $cropY = [int](($src.Height - $cropH) / 2)
}

Write-Host "Crop region: ${cropX},${cropY} ${cropW}x${cropH}"

# Create destination bitmap
$dest = New-Object System.Drawing.Bitmap($targetW, $targetH)
$dest.SetResolution(72, 72)

$g = [System.Drawing.Graphics]::FromImage($dest)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)

$g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Save as JPEG with high quality
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85L)

# Force save
if (Test-Path $outPath) {
    Remove-Item $outPath -Force
}
$dest.Save($outPath, $jpegCodec, $encoderParams)

$dest.Dispose()
$src.Dispose()

# Verify
$check = [System.Drawing.Image]::FromFile($outPath)
Write-Host "Output size: $($check.Width) x $($check.Height)"
$fileInfo = Get-Item $outPath
Write-Host "File size: $([math]::Round($fileInfo.Length / 1KB, 1)) KB"
$check.Dispose()

Write-Host "Done! OG image saved to $outPath"
