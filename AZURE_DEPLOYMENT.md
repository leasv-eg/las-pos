# Azure Deployment Guide for LAS POS

## Issue Diagnosed
The Azure deployment failed because:
1. Azure was trying to run the app as a Node.js server
2. The build step was not executed properly  
3. The static files from the `dist` folder weren't being served

## Solution

### Option 1: Azure Static Web Apps (Recommended)
This is the best option for React SPAs:

1. Go to Azure Portal
2. Create a new "Static Web App" resource instead of "Web App"
3. Connect to your GitHub repository
4. Set build configuration:
   - App location: `/`
   - Output location: `dist`
   - Build command: `npm run build`

### Option 2: Fix Current Azure Web App
If you want to keep using Azure Web App Service:

1. **Build the project locally:**
   ```powershell
   npm run build
   ```

2. **Deploy only the `dist` folder contents to Azure**
   - Upload only the contents of the `dist` folder to the wwwroot
   - Don't upload the source code

3. **Or update deployment script:**
   - The deploy.cmd file I created should handle the build process
   - Make sure Azure runs the build step during deployment

## What's in the `dist` folder?
✅ index.html - Main entry point
✅ Static assets (CSS, JS, images)  
✅ web.config - IIS configuration for SPA routing
✅ staticwebapp.config.json - Azure Static Web Apps configuration
✅ manifest.webmanifest - PWA manifest
✅ Service worker files for offline functionality

## Testing Locally
You can test the built version locally:
```powershell
npm run preview
```

This will serve the built files from the `dist` folder on http://localhost:4173
