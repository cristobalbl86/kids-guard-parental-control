# Generate Release Keystore for Android
# This script finds keytool and generates a release keystore

Write-Host "[*] Looking for keytool..." -ForegroundColor Cyan

# Find keytool.exe
$keytoolPaths = @(
    "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe",
    "C:\Program Files\Android\Android Studio\jre\bin\keytool.exe",
    "$env:JAVA_HOME\bin\keytool.exe"
)

$keytool = $null
foreach ($path in $keytoolPaths) {
    if (Test-Path $path) {
        $keytool = $path
        Write-Host "[+] Found keytool at: $path" -ForegroundColor Green
        break
    }
}

if (-not $keytool) {
    Write-Host "[-] keytool not found in common locations" -ForegroundColor Red
    Write-Host ""
    Write-Host "Searching in Android Studio directory..." -ForegroundColor Yellow

    $found = Get-ChildItem -Path "C:\Program Files\Android" -Recurse -Filter keytool.exe -ErrorAction SilentlyContinue | Select-Object -First 1

    if ($found) {
        $keytool = $found.FullName
        Write-Host "[+] Found keytool at: $keytool" -ForegroundColor Green
    } else {
        Write-Host "[-] Could not find keytool.exe" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Android Studio or JDK, then try again." -ForegroundColor Yellow
        exit 1
    }
}

# Navigate to android/app directory
$targetDir = Join-Path $PSScriptRoot "..\android\app"
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

Set-Location $targetDir

Write-Host ""
Write-Host "[*] Generating release keystore..." -ForegroundColor Cyan
Write-Host "Location: $targetDir\release.keystore" -ForegroundColor Gray
Write-Host ""

# Run keytool
& $keytool -genkeypair -v -storetype PKCS12 `
    -keystore release.keystore `
    -alias kidsguard-release `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[+] Keystore generated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[*] Location: $targetDir\release.keystore" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[!] IMPORTANT: Back up this keystore and passwords securely!" -ForegroundColor Yellow
    Write-Host "    If you lose them, you cannot update your app on Google Play." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Convert to base64: See docs/GOOGLE_PLAY_DEPLOYMENT.md" -ForegroundColor White
    Write-Host "2. Add to GitHub Secrets" -ForegroundColor White
    Write-Host "3. Configure Play Console" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "[-] Failed to generate keystore" -ForegroundColor Red
    exit 1
}
