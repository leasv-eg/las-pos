# Deploy LAS POS to Azure - PowerShell Script
# This script builds the project and deploys only the dist folder to Azure

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$WebAppName
)

Write-Host "🚀 Building LAS POS for production..." -ForegroundColor Green

# Build the project
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Create a deployment package with only the dist folder contents
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipFile = "laspos-deployment-$timestamp.zip"

Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

# Create zip file with dist contents
Compress-Archive -Path ".\dist\*" -DestinationPath $zipFile -Force

Write-Host "📤 Deploying to Azure Web App..." -ForegroundColor Yellow

# Deploy using Azure CLI (requires Azure CLI to be installed and logged in)
try {
    az webapp deployment source config-zip --resource-group $ResourceGroupName --name $WebAppName --src $zipFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
        Write-Host "🌐 Your app should be available at: https://$WebAppName.azurewebsites.net" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure Azure CLI is installed and you're logged in with 'az login'" -ForegroundColor Yellow
}

# Clean up the zip file
Remove-Item $zipFile -Force

Write-Host "🧹 Cleaned up deployment package" -ForegroundColor Gray

# Usage example:
# .\deploy-azure.ps1 -ResourceGroupName "your-resource-group" -WebAppName "your-web-app-name"
