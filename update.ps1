# School ERP — Windows Update Script
# Pulls latest code (if git-based) or just rebuilds images, re-runs migrations.

$ErrorActionPreference = "Stop"
Push-Location $PSScriptRoot
try {
    Write-Host "Naya build bana rahe hain..." -ForegroundColor Yellow
    docker compose build
    Write-Host "Migrations chala rahe hain..." -ForegroundColor Yellow
    docker compose run --rm migrate
    Write-Host "App restart kar rahe hain..." -ForegroundColor Yellow
    docker compose up -d
    Write-Host "Update complete." -ForegroundColor Green
} finally {
    Pop-Location
}
