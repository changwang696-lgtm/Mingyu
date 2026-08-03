param(
  [Parameter(Mandatory = $true)][string]$Upper,
  [Parameter(Mandatory = $true)][string]$Lower,
  [Parameter(Mandatory = $true)][string]$Overview,
  [string]$OutputDir
)

Add-Type -AssemblyName System.Drawing
if (-not $OutputDir) { $OutputDir = Join-Path $PSScriptRoot "..\public\assets\zodiac" }
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$crops = @(
  @{ Name = "rat"; Source = $Upper; X = 50; Y = 350 },
  @{ Name = "ox"; Source = $Upper; X = 555; Y = 350 },
  @{ Name = "tiger"; Source = $Upper; X = 1050; Y = 350 },
  @{ Name = "rabbit"; Source = $Upper; X = 50; Y = 1140 },
  @{ Name = "dragon"; Source = $Upper; X = 555; Y = 1140 },
  @{ Name = "snake"; Source = $Upper; X = 1050; Y = 1140 },
  @{ Name = "horse"; Source = $Lower; X = 35; Y = 250 },
  @{ Name = "goat"; Source = $Lower; X = 550; Y = 250 },
  @{ Name = "monkey"; Source = $Lower; X = 1050; Y = 250 },
  @{ Name = "rooster"; Source = $Lower; X = 35; Y = 1080 },
  @{ Name = "dog"; Source = $Lower; X = 550; Y = 1080 },
  @{ Name = "pig"; Source = $Lower; X = 1050; Y = 1080 }
)

foreach ($crop in $crops) {
  $sourceImage = [System.Drawing.Image]::FromFile($crop.Source)
  try {
    $canvas = New-Object System.Drawing.Bitmap 512, 512
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($canvas)
      try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $sourceRect = New-Object System.Drawing.Rectangle $crop.X, $crop.Y, 400, 400
        $targetRect = New-Object System.Drawing.Rectangle 0, 0, 512, 512
        $graphics.DrawImage($sourceImage, $targetRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
        $output = Join-Path $OutputDir "$($crop.Name).jpg"
        $canvas.Save($output, [System.Drawing.Imaging.ImageFormat]::Jpeg)
      } finally { $graphics.Dispose() }
    } finally { $canvas.Dispose() }
  } finally { $sourceImage.Dispose() }
}

$overviewImage = [System.Drawing.Image]::FromFile($Overview)
try {
  $report = New-Object System.Drawing.Bitmap 900, 1200
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($report)
    try {
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.DrawImage($overviewImage, 0, 0, 900, 1200)
      $report.Save((Join-Path $OutputDir "report-overview.jpg"), [System.Drawing.Imaging.ImageFormat]::Jpeg)
    } finally { $graphics.Dispose() }
  } finally { $report.Dispose() }
} finally { $overviewImage.Dispose() }
