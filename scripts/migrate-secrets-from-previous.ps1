# EKA-AI Secrets Migration Helper
# Helps migrate secrets from previous repo (ekaaiurgaa-glitch) to current repo (connecteka)

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  EKA-AI Secrets Migration Helper" -ForegroundColor Cyan
Write-Host "  From: ekaaiurgaa-glitch/eka-ai-platform" -ForegroundColor Gray
Write-Host "  To:   connecteka/eka-ai-platform" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$secrets = @{}

Write-Host "STEP 1: Copy Secrets from Previous Repository" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"
Write-Host "Go to: https://github.com/ekaaiurgaa-glitch/eka-ai-platform/settings/secrets/actions"
Write-Host "Copy these values from your previous repository:"
Write-Host ""

Write-Host "1.1 VITE_SUPABASE_URL" -ForegroundColor Green
Write-Host "    (e.g., https://xyz123.supabase.co)"
$secrets.VITE_SUPABASE_URL = Read-Host "Paste VITE_SUPABASE_URL"

Write-Host ""
Write-Host "1.2 VITE_SUPABASE_ANON_KEY" -ForegroundColor Green
Write-Host "    (starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
$secrets.VITE_SUPABASE_ANON_KEY = Read-Host "Paste VITE_SUPABASE_ANON_KEY"

Write-Host ""
Write-Host "1.3 VITE_API_URL (will be saved as BACKEND_URL)" -ForegroundColor Green
Write-Host "    (e.g., https://api.eka-ai.in or http://localhost:8001)"
$vite_api_url = Read-Host "Paste VITE_API_URL"
$secrets.BACKEND_URL = $vite_api_url

Write-Host ""
Write-Host "STEP 2: Generate New Secrets for Current Repository" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"
Write-Host ""

Write-Host "2.1 FIREBASE_TOKEN" -ForegroundColor Green
Write-Host "    To generate, run in terminal:"
Write-Host "    npm install -g firebase-tools"
Write-Host "    firebase login:ci"
Write-Host ""
$secrets.FIREBASE_TOKEN = Read-Host "Paste FIREBASE_TOKEN"

Write-Host ""
Write-Host "2.2 GCP_SA_KEY (Google Cloud Service Account)" -ForegroundColor Green
Write-Host "    Follow these steps:"
Write-Host "    1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts"
Write-Host "    2. Select project: eka-ai-c9d24"
Write-Host "    3. Create Service Account: github-actions-deployer"
Write-Host "    4. Grant roles: Cloud Run Admin, Service Account User, Storage Admin"
Write-Host "    5. Create Key → JSON → Download"
Write-Host "    6. Open the JSON file and copy ALL content"
Write-Host ""
Write-Host "Paste the entire JSON content (press Enter twice when done):" -ForegroundColor Cyan
$gcpKeyLines = @()
while ($true) {
    $line = Read-Host
    if ([string]::IsNullOrWhiteSpace($line) -and $gcpKeyLines.Count -gt 0) { break }
    $gcpKeyLines += $line
}
$secrets.GCP_SA_KEY = $gcpKeyLines -join "`n"

Write-Host ""
Write-Host "2.3 MONGODB_URI" -ForegroundColor Green
Write-Host "    Follow these steps:"
Write-Host "    1. Go to: https://cloud.mongodb.com/"
Write-Host "    2. Create free M0 cluster"
Write-Host "    3. Database Access → Add New Database User"
Write-Host "    4. Network Access → Add IP: 0.0.0.0/0"
Write-Host "    5. Clusters → Connect → Drivers → Python"
Write-Host "    6. Copy connection string (mongodb+srv://...)"
Write-Host ""
$secrets.MONGODB_URI = Read-Host "Paste MONGODB_URI"

Write-Host ""
Write-Host "2.4 GEMINI_API_KEY" -ForegroundColor Green
Write-Host "    Get from: https://aistudio.google.com/app/apikey"
Write-Host ""
$secrets.GEMINI_API_KEY = Read-Host "Paste GEMINI_API_KEY"

Write-Host ""
Write-Host "2.5 JWT_SECRET" -ForegroundColor Green
$generateNew = Read-Host "Generate new JWT_SECRET? (y/n)"
if ($generateNew -eq "y") {
    # Generate 64 character hex string
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $jwtSecret = ($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
    Write-Host "Generated JWT_SECRET: $jwtSecret" -ForegroundColor Green
    $secrets.JWT_SECRET = $jwtSecret
} else {
    $secrets.JWT_SECRET = Read-Host "Enter your JWT_SECRET"
}

Write-Host ""
Write-Host "STEP 3: Optional Secrets" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"
Write-Host ""

$resendKey = Read-Host "Enter RESEND_API_KEY for email (optional, press Enter to skip)"
if (-not [string]::IsNullOrWhiteSpace($resendKey)) {
    $secrets.RESEND_API_KEY = $resendKey
}

# Display summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Secrets Collection Complete!" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/connecteka/eka-ai-platform/settings/secrets/actions"
Write-Host "2. Click 'New repository secret' for each secret below"
Write-Host "3. Copy and paste the values"
Write-Host ""

foreach ($key in $secrets.Keys | Sort-Object) {
    $value = $secrets[$key]
    if ($key -eq "GCP_SA_KEY") {
        Write-Host "Name: $key" -ForegroundColor Green
        Write-Host "Value: [JSON content - see backup file]" -ForegroundColor Gray
    } else {
        $displayValue = if ($value.Length -gt 60) { $value.Substring(0, 60) + "..." } else { $value }
        Write-Host "Name: $key" -ForegroundColor Green
        Write-Host "Value: $displayValue" -ForegroundColor Gray
    }
    Write-Host ""
}

# Save to file for reference
$secretsJson = $secrets | ConvertTo-Json -Depth 10
$secretsFile = "secrets-migration-backup.json"
$secretsJson | Out-File -FilePath $secretsFile -Encoding UTF8

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Secrets saved to: $secretsFile" -ForegroundColor Yellow
Write-Host "⚠️  IMPORTANT: This file contains sensitive data!" -ForegroundColor Red
Write-Host "   1. Use it to copy secrets to GitHub" -ForegroundColor Yellow
Write-Host "   2. Delete it immediately after!" -ForegroundColor Red
Write-Host "   3. Do NOT commit this file to git!" -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Also create a summary without values for documentation
$summary = @"
# EKA-AI Secrets Summary
# Repository: connecteka/eka-ai-platform

## Required Secrets (8 total)

1. FIREBASE_TOKEN
   Source: firebase login:ci
   Used for: Firebase Hosting deployment

2. GCP_SA_KEY
   Source: Google Cloud Console
   Used for: Cloud Run deployment

3. MONGODB_URI
   Source: MongoDB Atlas
   Used for: Database connection

4. GEMINI_API_KEY
   Source: Google AI Studio
   Used for: AI features

5. JWT_SECRET
   Source: Generated (openssl rand -hex 32)
   Used for: JWT token signing

6. VITE_SUPABASE_URL
   Source: Previous repository
   Used for: Supabase connection (optional)

7. VITE_SUPABASE_ANON_KEY
   Source: Previous repository
   Used for: Supabase auth (optional)

8. BACKEND_URL
   Source: Previous repository (was VITE_API_URL)
   Used for: Frontend API calls

## Optional Secrets

9. RESEND_API_KEY
   Source: Resend.com
   Used for: Email notifications

## Migration Status

Migrated from previous repo:
- [x] VITE_SUPABASE_URL
- [x] VITE_SUPABASE_ANON_KEY
- [x] VITE_API_URL (as BACKEND_URL)

New secrets required:
- [x] FIREBASE_TOKEN
- [x] GCP_SA_KEY
- [x] MONGODB_URI
- [x] GEMINI_API_KEY
- [x] JWT_SECRET
"@

$summary | Out-File -FilePath "SECRETS_SUMMARY.md" -Encoding UTF8
Write-Host ""
Write-Host "Summary saved to: SECRETS_SUMMARY.md" -ForegroundColor Green
