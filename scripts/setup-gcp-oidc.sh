#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# GCP OIDC Setup Script for EKA-AI Platform
# Automates Workload Identity Federation configuration for GitHub Actions
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${PROJECT_ID:-eka-ai-c9d24}"
POOL_NAME="${POOL_NAME:-github-actions-pool}"
POOL_DISPLAY_NAME="${POOL_DISPLAY_NAME:-GitHub Actions Pool}"
PROVIDER_NAME="${PROVIDER_NAME:-github-provider}"
PROVIDER_DISPLAY_NAME="${PROVIDER_DISPLAY_NAME:-GitHub Actions Provider}"
SERVICE_ACCOUNT_NAME="${SERVICE_ACCOUNT_NAME:-firebase-deploy-sa}"
SERVICE_ACCOUNT_DISPLAY_NAME="${SERVICE_ACCOUNT_DISPLAY_NAME:-Firebase Deploy Service Account}"
GITHUB_REPO="${GITHUB_REPO:-connecteka/eka-ai-platform}"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
}

# Check if gcloud is installed
check_prerequisites() {
    print_step "Checking Prerequisites"
    
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first:"
        echo "  https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        print_error "Not authenticated with gcloud. Please run:"
        echo "  gcloud auth login"
        exit 1
    fi
    
    print_success "gcloud is installed and authenticated"
}

# Get or set project
setup_project() {
    print_step "Setting up GCP Project"
    
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || true)
    
    if [ -z "$CURRENT_PROJECT" ] || [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
        print_info "Setting project to: $PROJECT_ID"
        gcloud config set project "$PROJECT_ID"
    else
        print_info "Already using project: $PROJECT_ID"
    fi
    
    # Get project number
    PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
    print_success "Project ID: $PROJECT_ID"
    print_success "Project Number: $PROJECT_NUMBER"
}

# Enable required APIs
enable_apis() {
    print_step "Enabling Required APIs"
    
    APIS=(
        "iam.googleapis.com"
        "cloudresourcemanager.googleapis.com"
        "iamcredentials.googleapis.com"
        "sts.googleapis.com"
    )
    
    for api in "${APIS[@]}"; do
        print_info "Enabling $api..."
        gcloud services enable "$api" --project="$PROJECT_ID"
    done
    
    print_success "All required APIs enabled"
}

# Create Workload Identity Pool
create_workload_pool() {
    print_step "Creating Workload Identity Pool"
    
    if gcloud iam workload-identity-pools describe "$POOL_NAME" \
        --project="$PROJECT_ID" \
        --location="global" &>/dev/null; then
        print_warning "Workload Identity Pool '$POOL_NAME' already exists"
    else
        print_info "Creating Workload Identity Pool: $POOL_NAME"
        gcloud iam workload-identity-pools create "$POOL_NAME" \
            --project="$PROJECT_ID" \
            --location="global" \
            --display-name="$POOL_DISPLAY_NAME"
        print_success "Created Workload Identity Pool: $POOL_NAME"
    fi
    
    # Get pool ID
    POOL_ID=$(gcloud iam workload-identity-pools describe "$POOL_NAME" \
        --project="$PROJECT_ID" \
        --location="global" \
        --format="value(name)")
    print_success "Pool ID: $POOL_ID"
}

# Create Workload Identity Provider
create_workload_provider() {
    print_step "Creating Workload Identity Provider"
    
    if gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
        --project="$PROJECT_ID" \
        --location="global" \
        --workload-identity-pool="$POOL_NAME" &>/dev/null; then
        print_warning "Workload Identity Provider '$PROVIDER_NAME' already exists"
    else
        print_info "Creating Workload Identity Provider: $PROVIDER_NAME"
        
        # Create the provider with GitHub OIDC configuration
        gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
            --project="$PROJECT_ID" \
            --location="global" \
            --workload-identity-pool="$POOL_NAME" \
            --display-name="$PROVIDER_DISPLAY_NAME" \
            --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
            --attribute-condition="assertion.repository=='$GITHUB_REPO'" \
            --issuer-uri="https://token.actions.githubusercontent.com"
        
        print_success "Created Workload Identity Provider: $PROVIDER_NAME"
    fi
    
    # Get provider ID
    PROVIDER_ID=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
        --project="$PROJECT_ID" \
        --location="global" \
        --workload-identity-pool="$POOL_NAME" \
        --format="value(name)")
    print_success "Provider ID: $PROVIDER_ID"
}

# Create Service Account
create_service_account() {
    print_step "Creating Service Account"
    
    SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
    
    if gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" \
        --project="$PROJECT_ID" &>/dev/null; then
        print_warning "Service account '$SERVICE_ACCOUNT_NAME' already exists"
    else
        print_info "Creating Service Account: $SERVICE_ACCOUNT_NAME"
        gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
            --project="$PROJECT_ID" \
            --display-name="$SERVICE_ACCOUNT_DISPLAY_NAME" \
            --description="Service account for Firebase deployment via GitHub Actions"
        print_success "Created Service Account: $SERVICE_ACCOUNT_EMAIL"
    fi
    
    print_success "Service Account Email: $SERVICE_ACCOUNT_EMAIL"
}

# Grant roles to service account
grant_service_account_roles() {
    print_step "Granting Roles to Service Account"
    
    SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
    
    ROLES=(
        "roles/firebasehosting.admin"
        "roles/viewer"
    )
    
    for role in "${ROLES[@]}"; do
        print_info "Granting $role to $SERVICE_ACCOUNT_EMAIL"
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
            --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
            --role="$role" \
            --condition=None \
            --quiet
    done
    
    print_success "All roles granted"
}

# Grant Workload Identity User role
grant_workload_identity_user() {
    print_step "Configuring Workload Identity Federation"
    
    SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
    
    # Construct the principal set for the repository
    PRINCIPAL_SET="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/subject/repo:$GITHUB_REPO:ref:refs/heads/main"
    
    print_info "Granting Workload Identity User role to:"
    print_info "  Principal: $PRINCIPAL_SET"
    print_info "  Service Account: $SERVICE_ACCOUNT_EMAIL"
    
    # Remove existing binding if exists to avoid duplicates
    gcloud iam service-accounts remove-iam-policy-binding "$SERVICE_ACCOUNT_EMAIL" \
        --member="$PRINCIPAL_SET" \
        --role="roles/iam.workloadIdentityUser" \
        --quiet 2>/dev/null || true
    
    # Add the binding
    gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT_EMAIL" \
        --member="$PRINCIPAL_SET" \
        --role="roles/iam.workloadIdentityUser" \
        --quiet
    
    print_success "Workload Identity User role granted"
}

# Output configuration
print_configuration() {
    print_step "Configuration Complete!"
    
    SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
    WORKLOAD_IDENTITY_PROVIDER="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/providers/$PROVIDER_NAME"
    
    echo -e "\n${GREEN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Update your .github/workflows/deploy-frontend.yml with these values:${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}workload_identity_provider:${NC} '${BLUE}projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/providers/$PROVIDER_NAME${NC}'"
    echo -e "${YELLOW}service_account:${NC} '${BLUE}$SERVICE_ACCOUNT_EMAIL${NC}'"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Save to file for easy reference
    CONFIG_FILE="gcp-oidc-config.txt"
    cat > "$CONFIG_FILE" << EOF
# GCP OIDC Configuration for EKA-AI Platform
# Generated: $(date)

PROJECT_ID=$PROJECT_ID
PROJECT_NUMBER=$PROJECT_NUMBER
POOL_NAME=$POOL_NAME
PROVIDER_NAME=$PROVIDER_NAME
SERVICE_ACCOUNT_EMAIL=$SERVICE_ACCOUNT_EMAIL
WORKLOAD_IDENTITY_PROVIDER=$WORKLOAD_IDENTITY_PROVIDER
GITHUB_REPO=$GITHUB_REPO

# GitHub Workflow Configuration:
workload_identity_provider: 'projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/providers/$PROVIDER_NAME'
service_account: '$SERVICE_ACCOUNT_EMAIL'
EOF
    
    print_success "Configuration saved to: $CONFIG_FILE"
    
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo "1. Update .github/workflows/deploy-frontend.yml with the values above"
    echo "2. Remove the old FIREBASE_SERVICE_ACCOUNT_EKA_AI_C9D24 secret from GitHub"
    echo "3. Commit and push the workflow changes"
    echo "4. Trigger a deployment to test"
}

# Main execution
main() {
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║               GCP OIDC Setup for EKA-AI Platform                             ║"
    echo "║          Workload Identity Federation for GitHub Actions                     ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "\n${BLUE}Configuration:${NC}"
    echo "  Project ID: $PROJECT_ID"
    echo "  Pool Name: $POOL_NAME"
    echo "  Provider Name: $PROVIDER_NAME"
    echo "  Service Account: $SERVICE_ACCOUNT_NAME"
    echo "  GitHub Repo: $GITHUB_REPO"
    echo ""
    
    read -p "Continue with this configuration? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    check_prerequisites
    setup_project
    enable_apis
    create_workload_pool
    create_workload_provider
    create_service_account
    grant_service_account_roles
    grant_workload_identity_user
    print_configuration
    
    echo -e "\n${GREEN}🎉 Setup complete!${NC}"
}

# Run main function
main "$@"
