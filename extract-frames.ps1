# Video -> scroll-scrub frames, per 3d-web-builder/references/image-sequence.md
# Usage: ./extract-frames.ps1 -Url <mp4 url> -Name hero
param(
    [Parameter(Mandatory)] [string]$Url,
    [Parameter(Mandatory)] [ValidateSet("hero", "turn")] [string]$Name,
    [int]$Fps = 20,
    [int]$Width = 1600,
    [int]$Quality = 75
)
$ErrorActionPreference = "Stop"
$raw = "$PSScriptRoot\assets-src\$Name-raw.mp4"
$out = "$PSScriptRoot\public\sequences\$Name"

curl.exe -s -o $raw $Url
New-Item -ItemType Directory -Force $out | Out-Null
Remove-Item "$out\*.webp" -Force -ErrorAction SilentlyContinue

ffmpeg -y -i $raw -vf "fps=$Fps,scale=${Width}:-2" -c:v libwebp -q:v $Quality "$out\frame_%04d.webp" -loglevel error

$frames = Get-ChildItem "$out\*.webp"
$mb = [math]::Round(($frames | Measure-Object Length -Sum).Sum / 1MB, 1)
Write-Host "$Name : $($frames.Count) frames, $mb MB total"
if ($mb -gt 10) { Write-Warning "Over the 10 MB budget - raise -Quality compression (lower value) or lower -Fps." }

# first frame becomes the LCP poster
Copy-Item $frames[0].FullName "$PSScriptRoot\public\media\$Name-poster.webp" -Force
