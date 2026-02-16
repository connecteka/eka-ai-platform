# Install Railway CLI if not installed
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Clear cache and redeploy
railway up --clean

# Or just redeploy with fresh build
railway up
