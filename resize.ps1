Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('.\images\pipe_leak_pc.png')

$tabletWidth = 800
$tabletHeight = [math]::Round($img.Height * ($tabletWidth / $img.Width))
$tabletBmp = New-Object System.Drawing.Bitmap($tabletWidth, $tabletHeight)
$tabletGraph = [System.Drawing.Graphics]::FromImage($tabletBmp)
$tabletGraph.DrawImage($img, 0, 0, $tabletWidth, $tabletHeight)
$tabletBmp.Save('.\images\pipe_leak_tablet.png', [System.Drawing.Imaging.ImageFormat]::Png)
$tabletGraph.Dispose()
$tabletBmp.Dispose()

$mobileWidth = 400
$mobileHeight = [math]::Round($img.Height * ($mobileWidth / $img.Width))
$mobileBmp = New-Object System.Drawing.Bitmap($mobileWidth, $mobileHeight)
$mobileGraph = [System.Drawing.Graphics]::FromImage($mobileBmp)
$mobileGraph.DrawImage($img, 0, 0, $mobileWidth, $mobileHeight)
$mobileBmp.Save('.\images\pipe_leak_mobile.png', [System.Drawing.Imaging.ImageFormat]::Png)
$mobileGraph.Dispose()
$mobileBmp.Dispose()

$img.Dispose()
