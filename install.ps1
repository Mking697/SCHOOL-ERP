<#
  School ERP — Windows Installer
  Run this on the school's Windows server. It will:
    1. Check Docker Desktop is installed and running (tells you if not).
    2. Ask a few setup questions (school name, admin login, port).
    3. Generate a .env file with safe random secrets.
    4. Build and start everything with Docker Compose (app + Postgres DB).
    5. The database and Super Admin login are created automatically on first run.
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

# 2. Ask setup questions
$schoolName   = Read-Host "School ka naam (e.g. Green Valley Public School)"
$adminName    = Read-Host "Admin ka naam"
$adminEmail   = Read-Host "Admin login email"
$adminPassword = Read-Host "Admin password set karo (strong)" -AsSecureString
$adminPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassword)
)
$appPort = Read-Host "App kis port pe chalni chahiye (default 3000)"
if ([string]::IsNullOrWhiteSpace($appPort)) { $appPort = "3000" }

function New-RandomSecret {
    param([int]$Length = 32)
    $bytes = New-Object byte[] $Length
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    return [Convert]::ToBase64String($bytes) -replace '[^a-zA-Z0-9]', ''
}

$dbPassword = New-RandomSecret 24
$jwtSecret  = New-RandomSecret 48

# 3. Write .env
$envContent = @"
DATABASE_URL=postgresql://school_erp:$dbPassword@db:5432/school_erp?schema=public
JWT_SECRET=$jwtSecret
SEED_SCHOOL_NAME=$schoolName
SEED_ADMIN_NAME=$adminName
SEED_ADMIN_EMAIL=$adminEmail
SEED_ADMIN_PASSWORD=$adminPasswordPlain
POSTGRES_USER=school_erp
POSTGRES_PASSWORD=$dbPassword
POSTGRES_DB=school_erp
APP_PORT=$appPort
"@

$envPath = Join-Path $PSScriptRoot ".env"
Set-Content -Path $envPath -Value $envContent -Encoding UTF8
Write-Host "Config save ho gayi: $envPath" -ForegroundColor Green

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
Write-Host "App yahan khulegi: http://localhost:$appPort"
Write-Host "Login: $adminEmail"
Write-Host "(password wahi hai jo abhi set kiya)"
Write-Host ""
Write-Host "Status check karne ke liye: docker compose ps"
Write-Host "Logs dekhne ke liye: docker compose logs -f app"
