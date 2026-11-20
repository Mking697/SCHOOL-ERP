<#
School ERP setup installer (TEST or LIVE enrollment). Keep school-enrollment.json private.
Requires Docker Desktop and internet for the first build. School/admin setup
is completed in the browser; no default administrator password is installed.
Existing configuration and database volumes are NEVER deleted or overwritten.
#>
[CmdletBinding()]
param(
    [ValidateRange(1, 65535)][int]$AppPort = 3000,
    [ValidateRange(10, 600)][int]$ReadyTimeoutSeconds = 120,
    [switch]$ConfigureOnly
)
$ErrorActionPreference = "Stop"
$envPath = Join-Path $PSScriptRoot ".env"
try {
    if (Test-Path -LiteralPath $envPath) {
        throw "An existing configuration was found. It has NOT been overwritten. Use the update workflow or contact your administrator."
    }
    $enrollmentPath = Join-Path $PSScriptRoot "school-enrollment.json"
    if (!(Test-Path -LiteralPath $enrollmentPath -PathType Leaf)) {
        throw "Missing school-enrollment.json. Download your own verified setup package from the purchase page."
    }
    try { $enrollment = Get-Content -LiteralPath $enrollmentPath -Raw | ConvertFrom-Json } catch {
        throw "Invalid enrollment configuration. Download the setup again."
    }
    $paymentMode = "TEST"
    if ($null -ne $enrollment.PSObject.Properties['paymentMode']) {
        if ($enrollment.paymentMode -isnot [string] -or @("TEST", "LIVE") -cnotcontains $enrollment.paymentMode) {
            throw "Invalid enrollment payment mode. Download the setup again."
        }
        $paymentMode = $enrollment.paymentMode
    }
    $vendorUri = $null
    $validUrl = [Uri]::TryCreate([string]$enrollment.vendorUrl, [UriKind]::Absolute, [ref]$vendorUri)
    $localHttp = $validUrl -and $vendorUri.Scheme -eq "http" -and @("127.0.0.1", "localhost", "[::1]", "::1") -contains $vendorUri.Host
    if ($enrollment.version -ne 1 -or !$validUrl -or ($vendorUri.Scheme -ne "https" -and !$localHttp) -or $vendorUri.UserInfo -or $vendorUri.Query -or $vendorUri.Fragment -or $vendorUri.AbsolutePath -ne "/" -or [string]$enrollment.vendorUrl -match '[\r\n]' -or [string]$enrollment.schoolApiKey -notmatch '^[a-zA-Z0-9_-]{16,256}$' -or [string]$enrollment.purchaseId -notmatch '^[a-zA-Z0-9_-]{8,100}$' -or @("STARTER", "GROWTH", "PROFESSIONAL") -notcontains [string]$enrollment.pricingTier) {
        throw "Invalid enrollment configuration. Vendor address, purchase and school key must match the verified download."
    }
    if ($paymentMode -ceq "LIVE" -and (!$validUrl -or $vendorUri.Scheme -cne "https" -or $enrollment.vendorUrl -isnot [string] -or @($vendorUri.GetLeftPart([UriPartial]::Authority), ($vendorUri.GetLeftPart([UriPartial]::Authority) + "/")) -cnotcontains $enrollment.vendorUrl)) {
        throw "Invalid LIVE enrollment configuration. A canonical HTTPS vendor address is required."
    }
    $manifestPath = Join-Path $PSScriptRoot "manifest.json"
    if (Test-Path -LiteralPath $manifestPath) {
        try {
            if (!(Test-Path -LiteralPath $manifestPath -PathType Leaf)) { throw "Not a file" }
            $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
            if ($manifest -isnot [PSCustomObject] -or $manifest.formatVersion -isnot [int] -or $manifest.formatVersion -ne 1 -or $manifest.product -isnot [string] -or $manifest.product -cne "School ERP" -or $manifest.testOnly -isnot [bool]) { throw "Invalid metadata" }
            $manifestMode = "TEST"
            if ($null -ne $manifest.PSObject.Properties['paymentMode']) {
                if ($manifest.paymentMode -isnot [string] -or @("TEST", "LIVE") -cnotcontains $manifest.paymentMode) { throw "Invalid mode" }
                $manifestMode = $manifest.paymentMode
            }
            if ($manifestMode -cne $paymentMode -or $manifest.testOnly -ne ($paymentMode -ceq "TEST")) { throw "Mode mismatch" }
        } catch {
            throw "Invalid or inconsistent setup manifest. Download the setup again."
        }
    } elseif ($paymentMode -ceq "LIVE") {
        throw "Missing LIVE setup manifest. Download the setup again."
    }
    if (!$ConfigureOnly) {
        if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
            throw "Docker Desktop is required. Install/start Docker Desktop, then run this installer again."
        }
        & docker version --format '{{.Server.Version}}' | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Docker Desktop is not ready. Start it before installation." }
        & docker compose version | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Docker Compose is unavailable. Update Docker Desktop." }
    }
    function New-RandomHex {
        param([int]$Bytes)
        $buffer = New-Object byte[] $Bytes
        $random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        try { $random.GetBytes($buffer) } finally { $random.Dispose() }
        return ([BitConverter]::ToString($buffer)).Replace("-", "").ToLowerInvariant()
    }
    $dbPassword = New-RandomHex 24
    $jwtSecret = New-RandomHex 48
    $vendorUrl = $vendorUri.GetLeftPart([UriPartial]::Authority)
    $schoolKey = [string]$enrollment.schoolApiKey
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
APP_PORT=$AppPort
VENDOR_SERVER_URL=$vendorUrl
SCHOOL_API_KEY=$schoolKey
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
"@
    # Exclusive creation protects existing installs even if a second installer races.
    $stream = [IO.File]::Open($envPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
    $writer = New-Object IO.StreamWriter($stream, (New-Object Text.UTF8Encoding($false)))
    try { $writer.Write($envContent + "`n") } finally { $writer.Dispose() }
    $written = Get-Content -LiteralPath $envPath -Raw
    if (!$written.Contains("PGPASSWORD=$dbPassword") -or !$written.Contains("JWT_SECRET=$jwtSecret") -or !$written.Contains("SCHOOL_API_KEY=$schoolKey")) {
        throw "Configuration verification failed (possible endpoint-security redaction). No services were started. Keep the file private and contact support."
    }
    Write-Host "School ERP $paymentMode enrollment configuration created. Keep the setup folder and enrollment private."
    Write-Host "Enrollment mode is not payment proof or production readiness. Parent fee-payment keys remain unconfigured."
    if ($ConfigureOnly) {
        Write-Host "ConfigureOnly: services NOT started. This is not a completed installation."
        exit 0
    }
    Push-Location $PSScriptRoot
    try {
        & docker compose up -d --build
        if ($LASTEXITCODE -ne 0) { throw "Docker build/start failed. Configuration and database volumes were preserved. Inspect docker compose logs; do not delete your database." }
        $watch = [Diagnostics.Stopwatch]::StartNew()
        $ready = $false
        while ($watch.Elapsed.TotalSeconds -lt $ReadyTimeoutSeconds) {
            try {
                $response = Invoke-WebRequest -Uri "http://127.0.0.1:$AppPort/setup" -UseBasicParsing -TimeoutSec 5
                if ($response.StatusCode -eq 200 -and $response.Content -match "School ERP") { $ready = $true; break }
            } catch { }
            Start-Sleep -Seconds 2
        }
        if (!$ready) { throw "Services did not become HTTP-ready in time. Installation is NOT verified. Configuration/data are preserved; inspect docker compose ps and logs." }
    } finally { Pop-Location }
    Write-Host "School ERP is HTTP-ready: http://localhost:$AppPort/setup"
    Write-Host "Complete the school and administrator wizard. No administrator password was generated."
    Write-Host "Enrollment mode: $paymentMode. Parent fee-payment keys are separate and remain unconfigured."
} catch {
    Write-Error $_.Exception.Message -ErrorAction Continue
    exit 1
}
