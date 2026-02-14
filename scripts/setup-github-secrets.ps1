# EKA-AI GitHub Secrets Setup Helper
# This script helps you collect all required secrets for GitHub Actions deployment

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  EKA-AI GitHub Secrets Setup Helper" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if running in PowerShell
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Host "ERROR: This script requires PowerShell 5.0 or higher" -ForegroundColor Red
    exit 1
}

# Initialize secrets object
$secrets = @{}

Write-Host "STEP 1: Firebase Configuration" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"
Write-Host "You need a Firebase CI token for automated deployments."
Write-Host ""
Write-Host "To get your FIREBASE_TOKEN:" -ForegroundColor Green
Write-Host "  1. Install Firebase CLI: npm install -g firebase-tools"
Write-Host "  2. Run: firebase login:ci"
Write-Host "  3. Copy the token that appears"
Write-Host ""
$secrets.FIREBASE_TOKEN = Read-Host "Enter FIREBASE_TOKEN"

Write-Host ""
Write-Host "STEP 2: Google Cloud Configuration" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"
Write-Host "You need a Google Cloud service account key for Cloud Run deployment."
Write-Host ""
Write-Host "To get your GCP_SA_KEY:" -ForegroundColor Green
Write-Host "  1. Go to: https://console.cloud.google.com/"
Write-Host "  2. Select project: eka-ai-c9d24"
Write-Host "  3. IAM & Admin → Service Accounts"
Write-Host "  4. Create service account: github-actions-deployer"
Write-Host "  5. Grant roles: Cloud Run Admin, Service Account User, Storage Admin"
Write-Host "  6. Create Key → JSON → Download"
Write-Host "  7. Copy the ENTIRE JSON content"
Write-Host ""
Write-Host "Paste the entire JSON content (press Enter twice when done):" -ForegroundColor Green
$gcpKeyLines = @()
while ($true) {
    $line = Read-Host
    if ([string]::IsNullOrWhiteSpace($line) -and $gcpKeyLines.Count -gt 0) { break }
    $gcpKeyLines += $line
}
$secrets.GCP_SA_KEY = $gcpKeyLines -join "`n"

Write-Host ""
Write-Host "STEP 3: MongoDB Configuration" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"
Write-Host "You need a MongoDB connection string."
Write-Host ""
Write-Host "To get your MONGODB_URI:" -ForegroundColor Green
Write-Host "  1. Go to: https://cloud.mongodb.com/"
Write-Host "  2. Create a free M0 cluster"
Write-Host "  3. Database Access → Add New Database User"
Write-Host "  4. Network Access → Add IP: 0.0.0.0/0"
Write-Host "  5. Clusters → Connect → Drivers → Python"
Write-Host "  6. Copy the connection string"
Write-Host ""
$secrets.MONGODB_URI = Read-Host "Enter MONGODB_URI"

Write-Host ""
Write-Host "STEP 4: AI Configuration" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"
Write-Host "You need a Gemini API key for AI functionality."
Write-Host ""
Write-Host "To get your GEMINI_API_KEY:" -ForegroundColor Green
Write-Host "  1. Go to: https://aistudio.google.com/"
Write-Host "  2. Get API Key → Create API Key"
Write-Host ""
$secrets.GEMINI_API_KEY = Read-Host "Enter GEMINI_API_KEY"

Write-Host ""
Write-Host "STEP 5: JWT Secret" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"
Write-Host "You need a secret key for JWT token generation."
Write-Host ""
$generateNew = Read-Host "Generate a new JWT_SECRET? (y/n)"
if ($generateNew -eq "y") {
    $jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
    Write-Host "Generated JWT_SECRET: $jwtSecret" -ForegroundColor Green
    $secrets.JWT_SECRET = $jwtSecret
} else {
    $secrets.JWT_SECRET = Read-Host "Enter your JWT_SECRET"
}

Write-Host ""
Write-Host "STEP 6: Optional Configuration" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"
Write-Host "These are optional but recommended."
Write-Host ""

$resendKey = Read-Host "Enter RESEND_API_KEY (optional, press Enter to skip)"
if (-not [string]::IsNullOrWhiteSpace($resendKey)) {
    $secrets.RESEND_API_KEY = $resendKey
}

$supabaseUrl = Read-Host "Enter VITE_SUPABASE_URL (optional, press Enter to skip)"
if (-not [string]::IsNullOrWhiteSpace($supabaseUrl)) {
    $secrets.VITE_SUPABASE_URL = $supabaseUrl
    $supabaseKey = Read-Host "Enter VITE_SUPABASE_ANON_KEY"
    $secrets.VITE_SUPABASE_ANON_KEY = $supabaseKey
}

# Display summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Secrets Collection Complete!" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now add these secrets to your GitHub repository:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://github.com/connecteka/eka-ai-platform/settings/secrets/actions"
Write-Host "2. Click 'New repository secret' for each:"
Write-Host ""

foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    $displayValue = if ($value.Length -gt 50) { $value.Substring(0, 50) + "..." } else { $value }
    Write-Host "  Name: $key" -ForegroundColor Green
    Write-Host "  Value: $displayValue" -ForegroundColor Gray
    Write-Host ""
}

# Save to file for reference
$secretsJson = $secrets | ConvertTo-Json
$secretsFile = "github-secrets-backup.json"
$secretsJson | Out-File -FilePath $secretsFile -Encoding UTF8
Write-Host "Secrets saved to: $secretsFile" -ForegroundColor Yellow
Write-Host "⚠️  Keep this file secure and delete after adding to GitHub!" -ForegroundColor Red
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
