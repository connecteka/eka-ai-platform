# Manual Deployment Script for EKA-AI Platform
# Run this in Google Cloud Shell or with gcloud CLI configured

param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$SkipDocker
)

$ErrorActionPreference = "Stop"
$PROJECT_ID = "named-dialect-486912-c7"
$SERVICE_NAME = "eka-ai-backend"
$REGION = "asia-south1"

# Colors for output
function Write-Color($Message, $Color) {
    Write-Host $Message -ForegroundColor $Color
}

Write-Color "========================================" "Cyan"
Write-Color "  EKA-AI Platform Deployment Pipeline  " "Cyan"
Write-Color "========================================" "Cyan"
Write-Host ""

# ==================== PRE-DEPLOY CHECKS ====================
Write-Color "🔍 Pre-deployment checks..." "Yellow"

# Check gcloud
$gcloud = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $gcloud) {
    Write-Color "❌ gcloud CLI not found. Install from https://cloud.google.com/sdk" "Red"
    exit 1
}

# Check if user is logged in
$account = gcloud config get-value account 2>$null
if (-not $account) {
    Write-Color "❌ Not logged in to gcloud. Run: gcloud auth login" "Red"
    exit 1
}
Write-Color "✅ Logged in as: $account" "Green"

# Check project
$project = gcloud config get-value project 2>$null
if ($project -ne $PROJECT_ID) {
    Write-Color "⚠️  Setting project to $PROJECT_ID..." "Yellow"
    gcloud config set project $PROJECT_ID
}
Write-Color "✅ Project: $PROJECT_ID" "Green"

# Check Firebase CLI
$firebase = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebase) {
    Write-Color "⚠️  Firebase CLI not found. Install with: npm install -g firebase-tools" "Yellow"
}

Write-Host ""

# ==================== BUILD FRONTEND ====================
if (-not $SkipFrontend) {
    Write-Color "🛠️  Building frontend..." "Yellow"
    
    try {
        npm ci
        npm run build
        Write-Color "✅ Frontend build successful" "Green"
    }
    catch {
        Write-Color "❌ Frontend build failed: $_" "Red"
        exit 1
    }
    Write-Host ""
}

# ==================== DEPLOY BACKEND ====================
if (-not $SkipBackend) {
    Write-Color "☁️  Deploying backend to Cloud Run..." "Yellow"
    
    # Load environment variables from .env file if it exists
    $envVars = @()
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                if ($key -match "^(SUPABASE|PAYU|GOOGLE)") {
                    $envVars += "$key=$value"
                }
            }
        }
    }
    
    # Convert env vars to comma-separated string
    $envString = $envVars -join ","
    
    try {
        if ($envString) {
            gcloud run deploy $SERVICE_NAME `
                --source ./backend `
                --platform managed `
                --region $REGION `
                --allow-unauthenticated `
                --set-env-vars "$envString" `
                --memory 512Mi `
                --max-instances 10 `
                --quiet
        }
        else {
            # Deploy without env vars (must be set manually in Cloud Console)
            gcloud run deploy $SERVICE_NAME `
                --source ./backend `
                --platform managed `
                --region $REGION `
                --allow-unauthenticated `
                --memory 512Mi `
                --max-instances 10 `
                --quiet
        }
        
        # Get the backend URL
        $backendUrl = gcloud run services describe $SERVICE_NAME --region $REGION --format "value(status.url)"
        Write-Color "✅ Backend deployed to: $backendUrl" "Green"
        
        # Update frontend API URL
        Write-Color "ℹ️  Update VITE_API_URL in your .env and GitHub Secrets to: $backendUrl" "Yellow"
    }
    catch {
        Write-Color "❌ Backend deployment failed: $_" "Red"
        Write-Color "ℹ️  Make sure to set SUPABASE_URL and SUPABASE_KEY in Cloud Run environment variables" "Yellow"
    }
    Write-Host ""
}

# ==================== DEPLOY FRONTEND ====================
if (-not $SkipFrontend) {
    Write-Color "🔥 Deploying frontend to Firebase..." "Yellow"
    
    try {
        firebase deploy --only hosting
        Write-Color "✅ Frontend deployed to: https://eka-ai-platform.web.app" "Green"
    }
    catch {
        Write-Color "❌ Frontend deployment failed: $_" "Red"
        Write-Color "ℹ️  Make sure you're logged in: firebase login" "Yellow"
    }
    Write-Host ""
}

# ==================== SUMMARY ====================
Write-Color "========================================" "Cyan"
Write-Color "         Deployment Complete!          " "Cyan"
Write-Color "========================================" "Cyan"
Write-Host ""
Write-Color "📱 Frontend: https://eka-ai-platform.web.app" "White"

if (-not $SkipBackend) {
    $backendUrl = gcloud run services describe $SERVICE_NAME --region $REGION --format "value(status.url)" 2>$null
    if ($backendUrl) {
        Write-Color "⚙️  Backend: $backendUrl" "White"
        Write-Color "📊 Health Check: $backendUrl/api/health" "White"
    }
}

Write-Host ""
Write-Color "🔐 Remember to verify environment variables in:" "Yellow"
Write-Color "   - Cloud Run Console (for backend)" "Gray"
Write-Color "   - GitHub Secrets (for CI/CD)" "Gray"
