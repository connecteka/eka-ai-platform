# GCP OIDC Setup for EKA-AI Platform

This guide explains how to set up OpenID Connect (OIDC) authentication between GitHub Actions and Google Cloud Platform (GCP) for secure, keyless deployments.

## What is OIDC and Why Use It?

**OpenID Connect (OIDC)** allows GitHub Actions to authenticate with GCP without storing long-lived service account keys in GitHub Secrets.

### Benefits

| Approach | Security | Maintenance |
|----------|----------|-------------|
| **Long-lived Service Account Key** (current) | ⚠️ Static credential that never expires | Manual rotation required |
| **OIDC (Workload Identity Federation)** | ✅ Short-lived tokens (1 hour max) | Automatic, no keys to manage |

## Prerequisites

- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated
- Owner or IAM Admin role on the GCP project `eka-ai-c9d24`
- GitHub repository access

## Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
# Navigate to project root
cd /path/to/eka-ai-platform

# Run the setup script
bash scripts/setup-gcp-oidc.sh
```

The script will:
1. Create a Workload Identity Pool
2. Create a Workload Identity Provider for GitHub
3. Create a dedicated service account
4. Grant necessary permissions
5. Configure trust relationship
6. Output the values needed for your workflow

### Option 2: Manual Setup

If you prefer manual configuration, follow these steps:

#### 1. Enable Required APIs

```bash
gcloud services enable iam.googleapis.com \
    cloudresourcemanager.googleapis.com \
    iamcredentials.googleapis.com \
    sts.googleapis.com \
    --project=eka-ai-c9d24
```

#### 2. Create Workload Identity Pool

```bash
gcloud iam workload-identity-pools create github-actions-pool \
    --project=eka-ai-c9d24 \
    --location=global \
    --display-name="GitHub Actions Pool"
```

#### 3. Create Workload Identity Provider

```bash
PROJECT_NUMBER=$(gcloud projects describe eka-ai-c9d24 --format="value(projectNumber)")

gcloud iam workload-identity-pools providers create-oidc github-provider \
    --project=eka-ai-c9d24 \
    --location=global \
    --workload-identity-pool=github-actions-pool \
    --display-name="GitHub Actions Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --attribute-condition="assertion.repository=='connecteka/eka-ai-platform'" \
    --issuer-uri="https://token.actions.githubusercontent.com"
```

#### 4. Create Service Account

```bash
gcloud iam service-accounts create firebase-deploy-sa \
    --project=eka-ai-c9d24 \
    --display-name="Firebase Deploy Service Account"
```

#### 5. Grant Roles

```bash
# Grant Firebase Hosting Admin role
gcloud projects add-iam-policy-binding eka-ai-c9d24 \
    --member="serviceAccount:firebase-deploy-sa@eka-ai-c9d24.iam.gserviceaccount.com" \
    --role="roles/firebasehosting.admin"

# Grant Workload Identity User role
gcloud iam service-accounts add-iam-policy-binding \
    firebase-deploy-sa@eka-ai-c9d24.iam.gserviceaccount.com \
    --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/subject/repo:connecteka/eka-ai-platform:ref:refs/heads/main" \
    --role="roles/iam.workloadIdentityUser"
```

## Update GitHub Workflow

After running the setup script, update `.github/workflows/deploy-frontend.yml`:

```yaml
- name: Authenticate to Google Cloud
  id: auth
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider'
    service_account: 'firebase-deploy-sa@eka-ai-c9d24.iam.gserviceaccount.com'
```

Replace `PROJECT_NUMBER` with your actual GCP project number (shown in the script output).

## Verification

1. Commit and push the workflow changes
2. Navigate to GitHub Actions → Deploy Frontend to Firebase
3. Check that the deployment succeeds without using `FIREBASE_SERVICE_ACCOUNT_EKA_AI_C9D24` secret
4. Once confirmed, remove the old secret from GitHub Settings → Secrets

## Troubleshooting

### Error: "Could not find workload identity pool"

Ensure the APIs are enabled:
```bash
gcloud services enable iamcredentials.googleapis.com sts.googleapis.com --project=eka-ai-c9d24
```

### Error: "Permission denied"

Verify you have the necessary IAM permissions:
```bash
gcloud auth list
# Should show an account with Owner or IAM Admin role on eka-ai-c9d24
```

### Error: "Failed to fetch access token"

Check the Workload Identity Provider attribute condition matches your repository:
```bash
gcloud iam workload-identity-pools providers describe github-provider \
    --project=eka-ai-c9d24 \
    --location=global \
    --workload-identity-pool=github-actions-pool
```

## Security Considerations

- The attribute condition `assertion.repository=='connecteka/eka-ai-platform'` ensures only your specific repo can authenticate
- Tokens are valid for 1 hour maximum
- No long-lived credentials are stored in GitHub
- All authentication is auditable in GCP Cloud Logging

## References

- [Google Cloud Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions OIDC with GCP](https://github.com/google-github-actions/auth#workload-identity-federation)
- [Firebase Hosting Admin Role](https://firebase.google.com/docs/projects/iam/roles)
