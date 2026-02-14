# Generate Firebase Service Account for GitHub Actions
# Run this script to create the FIREBASE_SERVICE_ACCOUNT secret

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Firebase Service Account Generator   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
$gcloud = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $gcloud) {
    Write-Host "❌ gcloud CLI not found." -ForegroundColor Red
    Write-Host "   Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Gray
    exit 1
}

# Set project
$PROJECT_ID = "eka-ai-platform"
gcloud config set project $PROJECT_ID | Out-Null

Write-Host "Creating service account for Firebase Hosting..." -ForegroundColor Yellow

# Create service account
$SA_NAME = "github-actions-deployer"
$SA_EMAIL = "$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Check if service account exists
$saExists = gcloud iam service-accounts list --filter="email:$SA_EMAIL" --format="value(email)" 2>$null
if (-not $saExists) {
    Write-Host "Creating service account: $SA_NAME" -ForegroundColor Yellow
    gcloud iam service-accounts create $SA_NAME `
        --display-name="GitHub Actions Firebase Deployer" `
        --description="Service account for deploying to Firebase Hosting from GitHub Actions"
} else {
    Write-Host "Service account already exists: $SA_EMAIL" -ForegroundColor Green
}

# Grant Firebase Hosting Admin role
Write-Host "Granting Firebase Hosting Admin role..." -ForegroundColor Yellow
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SA_EMAIL" `
    --role="roles/firebasehosting.admin" | Out-Null

# Generate key
Write-Host "Generating service account key..." -ForegroundColor Yellow
$keyFile = "$env:TEMP\firebase-service-account.json"
gcloud iam service-accounts keys create $keyFile `
    --iam-account=$SA_EMAIL `
    --key-type=json

# Display the JSON
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Service Account Key Generated!       " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Copy the JSON below and add it to GitHub Secrets:" -ForegroundColor Yellow
Write-Host "URL: https://github.com/connecteka/eka-ai-platform/settings/secrets/actions" -ForegroundColor Cyan
Write-Host "Secret Name: FIREBASE_SERVICE_ACCOUNT" -ForegroundColor Cyan
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Get-Content $keyFile
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Cleanup
Remove-Item $keyFile -Force
Write-Host "✅ Done! The key file has been deleted for security." -ForegroundColor Green
