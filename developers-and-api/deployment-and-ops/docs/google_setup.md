# Google OAuth & Gemini API Setup Guide

This guide explains how to configure Google services for the EKA-AI platform.

## 🔐 Google OAuth 2.0 (Sign-In)

### Step 1: Configure in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `named-dialect-486912-c7`
3. Navigate to **APIs & Services > Credentials**
4. Find your OAuth 2.0 Client ID: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
5.  Add authorized redirect URIs:

    ```
    # Local dev (Vite default)
    http://localhost:5173/auth/callback

    # Firebase Hosting (add both)
    https://<your-site>.web.app/auth/callback
    https://<your-site>.firebaseapp.com/auth/callback

    # Custom domain (if you use one)
    https://<your-domain>/auth/callback
    ```
6.  Add authorized JavaScript origins:

    ```
    # Local dev
    http://localhost:5173

    # Firebase Hosting (add both)
    https://<your-site>.web.app
    https://<your-site>.firebaseapp.com

    # Custom domain (if you use one)
    https://<your-domain>
    ```

{% hint style="warning" %}
Do **not** put a Google OAuth **client secret** in the frontend (`VITE_*`).

Frontend gets only the **client ID**.

Anything secret lives on the server (Cloud Run) or in the OAuth provider (Supabase/Firebase).
{% endhint %}

### Step 2: Add to GitHub Secrets (CI/CD build-time)

**⚠️ DO NOT commit these credentials to the repository!**

Instead, add them to GitHub Secrets:

1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name             | Value                                              |
| ----------------------- | -------------------------------------------------- |
| `VITE_GOOGLE_CLIENT_ID` | `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` |

### Step 3: Configure Environment Variables

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Edit `.env` and add:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

## 🤖 Gemini API Setup

### Step 1: Get API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Select your Google Cloud project
4. Copy the generated key

### Step 2: Add to Secrets

| Secret Name           | Value                                      |
| --------------------- | ------------------------------------------ |
| `VITE_GEMINI_API_KEY` | `your-gemini-api-key`                      |
| `GEMINI_API_KEY`      | `your-gemini-api-key` (for GitHub Actions) |

## 🧪 Testing the Setup

### Test Google Sign-In

1.  Start the development server:

    ```bash
    npm run dev
    ```
2. Navigate to `http://localhost:3000/login`
3. Click "Sign in with Google"
4. You should see the Google OAuth consent screen

### Test Gemini Integration

1. Open the AI Chat window
2. Send a test message
3. Verify AI responses are working

## 🔒 Security Best Practices

### ✅ DO:

* Store credentials in GitHub Secrets
* Use `.env` file locally (it's in `.gitignore`)
* Rotate secrets periodically
* Use different credentials for dev/prod

### ❌ DON'T:

* Commit credentials to Git
* Share credentials in Slack/email
* Use production credentials in development
* Hardcode credentials in source code

## 🚀 Production Deployment

Before deploying to production:

1. **Verify authorized domains** in Google Cloud Console include your production domain
2.  **Add production secrets** to GitHub (if you separate envs):

    ```
    PROD_VITE_GOOGLE_CLIENT_ID
    PROD_VITE_GEMINI_API_KEY
    ```
3. **Update deployment workflow** to use production secrets

## 🐛 Troubleshooting

### "Error 400: redirect\_uri\_mismatch"

* Add your exact redirect URI to Google Cloud Console
* Must match the URL you're accessing (including port)

### "API key not valid"

* Ensure the API key is from the correct Google Cloud project
* Check that billing is enabled for the project

### "GitHub Actions failing"

* Verify `GEMINI_API_KEY` is set in repository secrets
* Check secret name matches exactly (case-sensitive)

## 📚 Additional Resources

* [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
* [Gemini API Documentation](https://ai.google.dev/docs)
* [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
