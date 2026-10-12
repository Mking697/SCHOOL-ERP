<#
  School ERP -- Windows Installer
  Run this on the school's Windows server. It will:
    1. Check Docker Desktop is installed and running (tells you if not).
    2. Ask only for the port to run on (defaults to 3000).
    3. Generate a .env file with safe random secrets.
    4. Build and start everything with Docker Compose (app + Postgres DB).
    5. The database is created automatically. Open the app in your browser
       and a one-time Setup Wizard will ask for your school name, logo and
       admin login -- no further terminal steps needed.
#>

$ErrorActionPreference = "Stop"

Write-Host "=== School ERP Installer ===" -ForegroundColor Cyan

# 1. Check Docker
try {
    docker version | Out-Null
} catch {
    Write-Host "Docker Desktop nahi mila ya chal nahi raha." -ForegroundColor Red
    Write-Host "Pehle Docker Desktop install/start karo: https://www.docker.com/products/docker-desktop/"
    exit 1
}

# 2. Ask only the port -- everything else (school, admin, branding) is set
# up via the web wizard on first launch.
$appPort = Read-Host "App kis port pe chalni chahiye (default 3000)"
if ([string]::IsNullOrWhiteSpace($appPort)) { $appPort = "3000" }

$razorpayKeyId = Read-Host "Razorpay Key ID (optional, online fee payment ke liye -- khali chhod sakte ho abhi)"
$razorpaySecret = Read-Host "Razorpay Key Secret (optional)"

function New-RandomSecret {
    param([int]$Length = 32)
    $bytes = New-Object byte[] $Length
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    return [Convert]::ToBase64String($bytes) -replace '[^a-zA-Z0-9]', ''
}

$dbPassword = New-RandomSecret 24
$jwtSecret  = New-RandomSecret 48

# 3. Write .env
# NOTE: no single DATABASE_URL here on purpose -- some Windows endpoint
# security tools (seen with Avast on this project) silently redact
# "scheme://user:pass@host" shaped text to "***" when written to disk. The
# app builds the Postgres connection string in memory from these separate
# pieces instead (see prisma.config.ts / src/lib/db.ts). SEED_* vars are
# intentionally NOT set -- the web /setup wizard handles first-run setup.
$envContent = @"
PGHOST=db
PGPORT=5432
PGUSER=school_erp
PGPASSWORD=$dbPassword
PGDATABASE=school_erp
JWT_SECRET=$jwtSecret
POSTGRES_USER=school_erp
POSTGRES_PASSWORD=$dbPassword
POSTGRES_DB=school_erp
APP_PORT=$appPort
RAZORPAY_KEY_ID=$razorpayKeyId
RAZORPAY_KEY_SECRET=$razorpaySecret
"@

$envPath = Join-Path $PSScriptRoot ".env"
Set-Content -Path $envPath -Value $envContent -Encoding UTF8
Write-Host "Config save ho gayi: $envPath" -ForegroundColor Green

# Sanity check: verify the password actually landed on disk unredacted.
# If an AV/DLP tool on this machine rewrites secret-shaped text, catch it
# here instead of failing confusingly later inside the container.
$writtenContent = Get-Content -Path $envPath -Raw
if ($writtenContent -notmatch [regex]::Escape($dbPassword)) {
    Write-Host "WARNING: DB password .env mein sahi se save nahi hui (antivirus/DLP ne block kiya ho sakta hai)." -ForegroundColor Red
    Write-Host "Avast ya koi aur security software ki 'file shredder' / sensitive-data protection exclude karo is folder ke liye, phir dobara install.ps1 chalao." -ForegroundColor Red
    exit 1
}

# 4. Build & start
Write-Host "Docker images build ho rahi hain, pehli baar thoda time lagega..." -ForegroundColor Yellow
Push-Location $PSScriptRoot
try {
    docker compose up -d --build
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "=== Install complete ===" -ForegroundColor Cyan
Write-Host "Ab apne browser mein kholo: http://localhost:$appPort"
Write-Host "Pehli baar khulne par ek Setup Wizard aayega -- wahan apna School"
Write-Host "Name, Logo, aur Admin login (email/password) set karo. Bas."
Write-Host ""
Write-Host "Status check karne ke liye: docker compose ps"
Write-Host "Logs dekhne ke liye: docker compose logs -f app"
