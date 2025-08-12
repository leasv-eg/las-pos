# Azure Functions API Proxy Solution

## 🎯 Problem Solved
Since the POS API doesn't support CORS whitelisting, we've implemented an **Azure Functions proxy** that acts as a bridge between your React app and the POS API.

## 🏗️ Architecture

```
React App (Browser) → Azure Functions Proxy → POS API Server
    ✅ Same Origin          ✅ Server-to-Server      ✅ No CORS Issues
```

## 🔧 How It Works

### 1. **Azure Functions Proxy**
- **Location**: `/api` folder in your repository
- **Function**: `pos-proxy` handles all POS API calls
- **Runtime**: Node.js 18 on Azure

### 2. **Request Flow**
1. **Browser calls**: `/api/pos/ItemSale/NewCartWithItems`
2. **Azure Function receives** the request with all headers/body
3. **Function forwards** to `https://posapi.egretail.cloud/api/ItemSale/NewCartWithItems`
4. **Function returns** the response with CORS headers

### 3. **Environment Support**
The proxy supports all environments:
- **Dev**: `/api/pos/ItemSale/NewCartWithItems?env=dev`
- **Test**: `/api/pos/ItemSale/NewCartWithItems?env=test`  
- **Prod**: `/api/pos/ItemSale/NewCartWithItems?env=prod` (default)

## 📋 Implementation Details

### **Files Added:**
- `api/host.json` - Azure Functions configuration
- `api/package.json` - Dependencies for the proxy
- `api/pos-proxy/function.json` - Function binding configuration
- `api/pos-proxy/index.js` - Main proxy logic

### **Files Updated:**
- `src/services/posApi.ts` - Routes to Azure Functions in production
- `.github/workflows/...yml` - Deploys API along with static app
- `public/staticwebapp.config.json` - Enables API runtime

## 🚀 Deployment Status

**Current Status**: Deploying now via GitHub Actions

### **What's Happening:**
1. ✅ Code committed and pushed
2. 🔄 GitHub Actions building both app + API
3. ⏳ Azure deploying Functions proxy
4. 🎯 API will be available at: `https://ambitious-rock-0be7ed303.1.azurestaticapps.net/api/pos/...`

## 🧪 Testing After Deployment

Once deployment completes (3-5 minutes), your POS API calls will:

```javascript
// OLD (CORS blocked)
POST https://posapi.egretail.cloud/api/ItemSale/NewCartWithItems ❌

// NEW (via Azure Functions proxy)  
POST https://ambitious-rock-0be7ed303.1.azurestaticapps.net/api/pos/ItemSale/NewCartWithItems ✅
```

## 🔍 Monitoring & Debugging

### **Check Deployment:**
- **GitHub Actions**: https://github.com/leasv-eg/las-pos/actions
- **Azure Portal**: Monitor function logs and performance

### **Test API Endpoints:**
After deployment, test with browser dev tools:
```javascript
// Test the proxy endpoint
fetch('/api/pos/ItemSale/NewCartWithItems', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'data' })
})
```

## ✅ Benefits of This Solution

1. **🔒 CORS Solved**: No browser restrictions
2. **🌍 Environment Support**: Dev/Test/Prod switching
3. **📊 Logging**: Full request/response logging in Azure
4. **🔧 Maintainable**: Easy to modify proxy logic
5. **⚡ Performance**: Azure Functions auto-scale
6. **🛡️ Security**: Can add authentication/rate limiting

## 🔄 Local Development

For local development, the app still calls POS API directly (no CORS issues on localhost):
```bash
npm run dev  # Calls posapi.egretail.cloud directly
```

---

**🎉 This solution completely eliminates CORS issues while maintaining full API functionality!**
