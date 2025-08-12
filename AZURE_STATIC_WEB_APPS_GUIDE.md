# Azure Static Web Apps Setup Guide for LAS POS

## ✅ Prerequisites Complete
- [x] Git repository initialized and committed
- [x] Azure Static Web Apps workflow created
- [x] Build configuration verified (builds successfully)
- [x] Static files generated in `dist` folder

## Step-by-Step Instructions

### Step 1: Push to GitHub (Do this first)

Since your code is ready and committed locally, you need to push it to GitHub:

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `las-pos` (or any name you prefer)
   - Make it **Public** (required for free Azure Static Web Apps)
   - **Do NOT** initialize with README, .gitignore, or license (since you already have these)
   - Click "Create repository"

2. **Push your local code to GitHub:**
   ```powershell
   # Replace 'your-github-username' with your actual GitHub username
   git remote add origin https://github.com/your-github-username/las-pos.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Create Azure Static Web App

1. **Go to Azure Portal:**
   - Navigate to https://portal.azure.com
   - Sign in with your Azure account

2. **Create new Static Web App:**
   - Click "Create a resource"
   - Search for "Static Web Apps"
   - Click "Static Web Apps" → "Create"

3. **Configure the Static Web App:**
   - **Subscription:** Select your Azure subscription
   - **Resource Group:** Create new or select existing
   - **Name:** `las-pos-app` (or any unique name)
   - **Plan type:** Free (perfect for development and small production apps)
   - **Region:** Choose closest to your users (e.g., West Europe)
   - **Source:** GitHub
   - **Sign in to GitHub** when prompted

4. **Configure GitHub Integration:**
   - **Organization:** Your GitHub username
   - **Repository:** `las-pos` (or whatever you named it)
   - **Branch:** `main`

5. **Build Configuration:**
   - **Build Presets:** React
   - **App location:** `/` (root folder)
   - **Api location:** (leave empty)
   - **Output location:** `dist`

6. **Click "Review + create" → "Create"**

### Step 3: Automatic Deployment

Azure will automatically:
1. ✅ Add a deployment token to your GitHub repository secrets
2. ✅ Create a GitHub Actions workflow (merges with the one we created)
3. ✅ Trigger the first build and deployment
4. ✅ Provide you with a public URL

### Step 4: Monitor Deployment

1. **Check GitHub Actions:**
   - Go to your GitHub repository
   - Click "Actions" tab
   - Watch the deployment progress

2. **Check Azure Portal:**
   - Go back to your Static Web App resource
   - View deployment status and logs
   - Get your public URL (something like: `https://victorious-field-xxx.1.azurestaticapps.net`)

### Step 5: Access Your App

Once deployment is complete (usually 2-5 minutes):
- Your LAS POS app will be live at the provided URL
- It will include PWA features, offline functionality, and proper routing
- Any future pushes to the `main` branch will automatically redeploy

## Troubleshooting

### If Build Fails:
- Check GitHub Actions logs for specific errors
- Common issues: missing dependencies, TypeScript errors
- The build should work since we tested it locally

### If App Shows 404:
- Check that `output_location` is set to `dist`
- Verify the `staticwebapp.config.json` file is in the `dist` folder

### If Routing Doesn't Work:
- Ensure `web.config` and `staticwebapp.config.json` are properly configured (they are!)

## Next Steps After Deployment

1. **Custom Domain (Optional):**
   - Add your own domain in Azure Static Web Apps settings

2. **Environment Variables:**
   - Configure any API endpoints in Azure Static Web Apps configuration

3. **Authentication (Future):**
   - Enable Azure AD, GitHub, or other auth providers

## GitHub Commands to Run

```powershell
# Navigate to your project
cd "c:\Users\leasv\OneDrive - EG A S\Code\LASPOS"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/las-pos.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🎉 You're Ready!

Your LAS POS PWA is ready for Azure Static Web Apps deployment!
