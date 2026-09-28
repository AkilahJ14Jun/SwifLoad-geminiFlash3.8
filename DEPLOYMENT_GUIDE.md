# 📘 SwifLoad — Cloud Deployment & Mobile App Distribution Guide

This document provides a complete, step-by-step technical guide for deploying the **SwifLoad** on-demand city logistics platform to **Microsoft Azure**, configuring the centralized real-time synchronization database, and compiling and distributing native mobile applications (Customer and Driver-Partner APKs + Progressive Web Apps).

---

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & System Requirements](#2-prerequisites--system-requirements)
3. [Step-by-Step Deployment Procedure](#3-step-by-step-deployment-procedure)
   - [Phase 1: Codebase Preparation for Cloud Multi-Tenant State](#phase-1-codebase-preparation-for-cloud-multi-tenant-state)
   - [Phase 2: Azure Cloud Infrastructure Provisioning](#phase-2-azure-cloud-infrastructure-provisioning)
   - [Phase 3: Docker Container Build via Azure Container Registry](#phase-3-docker-container-build-via-azure-container-registry)
   - [Phase 4: Web App Container Configuration & Activation](#phase-4-web-app-container-configuration--activation)
   - [Phase 5: Native Android Mobile APK Packaging & Distribution](#phase-5-native-android-mobile-apk-packaging--distribution)
   - [Phase 6: Final Container Update with Live APK Binaries](#phase-6-final-container-update-with-live-apk-binaries)
4. [Verification & Acceptance Testing](#4-verification--acceptance-testing)
5. [Troubleshooting & Pitfall Resolution](#5-troubleshooting--pitfall-resolution)
6. [Operational URLs & Resources Reference](#6-operational-urls--resources-reference)

---

## 1. Architecture Overview

```
                      +---------------------------------------+
                      |         Microsoft Azure Cloud         |
                      |        Resource Group: rg-swifload     |
                      |        Region: centralindia           |
                      +---------------------------------------+
                                          |
                   +----------------------+----------------------+
                   |                                             |
     +---------------------------+                +---------------------------+
     | Azure Container Registry  |                |     Azure App Service     |
     |   acrswifload.azurecr.io  |  Docker Pull   |       (Linux B1)          |
     |   Image: swifload:latest  | -------------> |       swifload-cbe        |
     +---------------------------+                |   Port: 8080 (Standalone) |
                                                  +---------------------------+
                                                                |
                                             +------------------+------------------+
                                             |                  |                  |
                                     Persistent DB         SSE Stream          REST APIs
                                    (/data/db.json)       (/api/events)      (/api/state)
                                             |                  |                  |
                                             +------------------+------------------+
                                                                |
         +-----------------------------+------------------------+-----------------------------+
         |                             |                                                       |
         v                             v                                                       v
+------------------+          +------------------+                                   +------------------+
| Operations Admin |          |   Customer App   |                                   |  Driver-Partner  |
|  (/admin Web)    |          | (/customer Web & |                                   |  (/driver Web &  |
|                  |          |   Android APK)   |                                   |   Android APK)   |
+------------------+          +------------------+                                   +------------------+
         ^                             ^                                                       ^
         |                             |                                                       |
         +-----------------------------+-------------------------------------------------------+
                           Real-Time Instant Event Propagation (SSE)
```

- **Frontend & App Engine:** Next.js 14 App Router (React 18 + Tailwind CSS + TypeScript).
- **Hosting Engine:** Azure App Service on Linux (Basic B1 tier) running inside a lightweight, multi-stage Alpine Docker container (`node:20-alpine`).
- **Container Registry:** Azure Container Registry (`acrswifload.azurecr.io`) with Cloud Build capabilities (`az acr build`).
- **Centralized Persistence:** Server-side file-backed storage (`src/lib/server/db.ts`) with dynamic in-memory fallback.
- **Real-Time Synchronization Engine:** Server-Sent Events (SSE) broadcasting system (`/api/events`) with automatic 20s keepalive heartbeats.
- **Mobile Apps:** Native Android debug packages built via Capacitor 6 & Gradle 8.2.1, alongside 1-tap Progressive Web Apps (PWA).

---

## 2. Prerequisites & System Requirements

Ensure the following tools and accounts are available before starting:

1. **Azure Cloud Subscription:**
   - Active account (e.g. `akilahj@adwayit.com`).
   - Subscription ID: `53f8852d-7390-4daf-8cc4-4e53e1769fb2` (or your target subscription).
2. **Azure CLI:**
   - Version `2.90.0` or later installed (`az --version`).
3. **Local Developer Tools:**
   - Node.js 20 LTS & `npm 10+`.
   - Java Development Kit 17 (e.g. Microsoft JDK 17 / OpenJDK 17).
   - Android Studio & Android SDK (SDK Platform 34, Build-Tools 34.0.0).
   - Git & PowerShell 7+ or Bash.

---

## 3. Step-by-Step Deployment Procedure

### Phase 1: Codebase Preparation for Cloud Multi-Tenant State

To ensure that the Operations Admin, Customer App, and Driver-Partner App all update to the same database in real-time, the codebase must migrate away from isolated browser `localStorage` to a centralized cloud backend.

#### Step 1.1: Enable Next.js Standalone Output
In `next.config.mjs`, configure Next.js for containerized execution:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
};

export default nextConfig;
```

#### Step 1.2: Create Centralized Server Database Layer
Create `src/lib/server/db.ts`:
- Implements `getDatabase()`, `saveDatabase()`, and `resetDatabase()`.
- Reads and writes to persistent storage (`/home/data` in Azure or `./data` locally).
- Initializes default entities for drivers, trips, driver groups, customer slab configurations, and wallets.

#### Step 1.3: Build Real-Time SSE Broadcaster
1. Create `src/lib/server/events.ts`:
   - Instantiates a singleton `EventEmitter` (`eventBus`) supporting typed events (`TRIP_CREATED`, `TRIP_UPDATED`, `DRIVER_UPDATED`, `WALLET_UPDATED`, `CONFIG_UPDATED`).
2. Create `src/app/api/events/route.ts`:
   - Returns a `ReadableStream` streaming Server-Sent Events (`text/event-stream`).
   - Sends a heartbeat comment (`: ping\n\n`) every 20 seconds to prevent Azure edge proxies from terminating idle connections.

#### Step 1.4: Implement Universal State & Entity Endpoints
Create Next.js App Router API route handlers:
- `src/app/api/state/route.ts`: Complete snapshot retrieval and administrative reset.
- `src/app/api/trips/route.ts` & `src/app/api/trips/[id]/route.ts`: Booking creation, status transitions, OTP verification, and ratings.
- `src/app/api/drivers/route.ts` & `src/app/api/drivers/[id]/route.ts`: Driver onboarding, active state toggles, and KYC approvals.
- `src/app/api/wallets/route.ts`: Driver and customer wallet balances, top-ups, and overdraft limit management.
- `src/app/api/config/route.ts`: Live slab pricing configuration updates.

#### Step 1.5: Bind Client Context to Cloud Backend
In `src/context/LogisticsContext.tsx`:
- On component mount, invoke `fetch('/api/state')` to hydrate the React state with the central cloud database.
- Open `new EventSource('/api/events')` to receive real-time mutations from other clients and update the React state without a page refresh.
- Wrap user actions (`createBooking`, `acceptTripByDriver`, `toggleDriverOnline`, etc.) with asynchronous HTTP requests to the respective `/api/*` endpoints.

#### Step 1.6: Create Multi-Stage Dockerfile & Ignore Rules
1. Create `Dockerfile` in the project root:
```dockerfile
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
```

2. Create `.dockerignore`:
```
node_modules
.git
.next
android
*.zip
*.log
out
```

---

### Phase 2: Azure Cloud Infrastructure Provisioning

Run these commands using PowerShell or Bash.

#### Step 2.1: Authenticate Azure CLI
```powershell
az login
az account set --subscription "53f8852d-7390-4daf-8cc4-4e53e1769fb2"
```

#### Step 2.2: Create Resource Group
```powershell
az group create --name rg-swifload --location centralindia
```

#### Step 2.3: Create Azure Container Registry (ACR)
```powershell
az acr create --resource-group rg-swifload --name acrswifload --sku Basic --admin-enabled true --location centralindia
```

#### Step 2.4: Create App Service Plan
Create a 64-bit Linux App Service Plan:
```powershell
az appservice plan create --name plan-swifload --resource-group rg-swifload --sku B1 --is-linux --location centralindia
```

#### Step 2.5: Create Web App Skeleton
```powershell
az webapp create --name swifload-cbe --resource-group rg-swifload --plan plan-swifload --deployment-container-image-name mcr.microsoft.com/appsvc/staticsite:latest
```

---

### Phase 3: Docker Container Build via Azure Container Registry

Instead of relying on local Docker daemons or cross-platform Windows-to-Linux path issues, build the image directly in the Azure cloud.

#### Step 3.1: Trigger Cloud Build
```powershell
$env:PYTHONIOENCODING="utf-8"
az acr build --registry acrswifload --image swifload:latest .
```

#### Step 3.2: Verify Build Run Status
```powershell
az acr task list-runs --registry acrswifload --output table
```
Verify that the `STATUS` column reports `Succeeded`.

---

### Phase 4: Web App Container Configuration & Activation

#### Step 4.1: Retrieve ACR Admin Credentials
```powershell
$creds = az acr credential show --name acrswifload | ConvertFrom-Json
$adminUser = $creds.username
$adminPass = $creds.passwords[0].value
```

#### Step 4.2: Link Web App to Container Registry
```powershell
az webapp config container set `
  --name swifload-cbe `
  --resource-group rg-swifload `
  --container-image-name acrswifload.azurecr.io/swifload:latest `
  --container-registry-url https://acrswifload.azurecr.io `
  --container-registry-user $adminUser `
  --container-registry-password $adminPass
```

#### Step 4.3: Set Environment Variables & Listening Ports
Azure App Service routes ingress HTTP traffic to the port declared in `WEBSITES_PORT`:
```powershell
az webapp config appsettings set `
  --name swifload-cbe `
  --resource-group rg-swifload `
  --settings `
    WEBSITES_PORT=8080 `
    PORT=8080 `
    NODE_ENV=production `
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false
```

#### Step 4.4: Restart Web App
```powershell
az webapp restart --name swifload-cbe --resource-group rg-swifload
```

---

### Phase 5: Native Android Mobile APK Packaging & Distribution

#### Step 5.1: Point Capacitor to Azure Cloud Domain
In `capacitor.config.ts`, configure the native container to point directly to the live cloud URL:
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swifload.logistics',
  appName: 'SwifLoad',
  webDir: 'out',
  server: {
    url: 'https://swifload-cbe.azurewebsites.net',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#111827",
      showSpinner: true,
      spinnerColor: "#16a34a"
    }
  }
};

export default config;
```

#### Step 5.2: Sync Capacitor Android Platform
```powershell
if (-not (Test-Path "out")) { New-Item -ItemType Directory -Path "out" -Force }
Set-Content -Path "out/index.html" -Value "<html><body>Loading SwifLoad Cloud...</body></html>" -Force
npx cap sync android
```

#### Step 5.3: Compile Native Android APK via Gradle
Set `JAVA_HOME` and compile using the Gradle wrapper:
```powershell
$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
Push-Location "android"
.\gradlew.bat assembleDebug
Pop-Location
```
The compiled debug binary will be created at:
`android/app/build/outputs/apk/debug/app-debug.apk`

#### Step 5.4: Publish APKs to Public Download Directory
```powershell
if (-not (Test-Path "public/downloads")) { New-Item -ItemType Directory -Path "public/downloads" -Force }
Copy-Item "android/app/build/outputs/apk/debug/app-debug.apk" "public/downloads/SwifLoad-Customer.apk" -Force
Copy-Item "android/app/build/outputs/apk/debug/app-debug.apk" "public/downloads/SwifLoad-Driver.apk" -Force
```

---

### Phase 6: Final Container Update with Live APK Binaries

Rebuild and push the updated container so that `/downloads/SwifLoad-Customer.apk` and `/downloads/SwifLoad-Driver.apk` are served live:

#### Step 6.1: Run Local Build Verification
```powershell
npm run build
```
Verify 0 compilation and TypeScript errors.

#### Step 6.2: Rebuild Cloud Container
```powershell
$env:PYTHONIOENCODING="utf-8"
az acr build --registry acrswifload --image swifload:latest .
```

#### Step 6.3: Trigger Web App Container Restart
```powershell
az webapp restart --name swifload-cbe --resource-group rg-swifload
```

---

## 4. Verification & Acceptance Testing

Execute these verification tests to confirm the deployment:

### Test 1: Web App Health & Route Status
Run in PowerShell:
```powershell
foreach ($path in @("", "customer", "driver", "admin", "downloads", "api/state")) {
  $res = Invoke-WebRequest -Uri "https://swifload-cbe.azurewebsites.net/$path" -UseBasicParsing
  Write-Output "/$path => Status: $($res.StatusCode), Size: $($res.Content.Length) bytes"
}
```
*Expected Result:* All return `Status: 200`.

### Test 2: Real-Time Multi-Client Database Mutation Test
1. Send a POST request to create a new trip:
```powershell
$body = @{
  customerName = "Verification Test"
  customerPhone = "+91 94433 11223"
  pickupAddress = "Gandhipuram, Coimbatore"
  pickupLat = 11.0183
  pickupLng = 76.9644
  dropoffAddress = "RS Puram, Coimbatore"
  dropoffLat = 11.0094
  dropoffLng = 76.9452
  vehicleType = "3_WHEELER"
  paymentMethod = "COD"
  baseFare = 160
  tax = 8
  totalFare = 168
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://swifload-cbe.azurewebsites.net/api/trips" -Method Post -Body $body -ContentType "application/json"
```
2. Verify trip appears in `https://swifload-cbe.azurewebsites.net/api/state`.
3. Open `https://swifload-cbe.azurewebsites.net/admin` and `https://swifload-cbe.azurewebsites.net/driver` in separate browser windows to confirm immediate appearance without manual page refresh.

### Test 3: Mobile APK Download Verification
```powershell
$c = Invoke-WebRequest -Uri "https://swifload-cbe.azurewebsites.net/downloads/SwifLoad-Customer.apk" -Method Head -UseBasicParsing
$d = Invoke-WebRequest -Uri "https://swifload-cbe.azurewebsites.net/downloads/SwifLoad-Driver.apk" -Method Head -UseBasicParsing
Write-Output "Customer APK: $($c.StatusCode) ($($c.Headers['Content-Length']) bytes)"
Write-Output "Driver APK: $($d.StatusCode) ($($d.Headers['Content-Length']) bytes)"
```
*Expected Result:* Both return `Status: 200` with file sizes ~3.75 MB (`3747636 bytes`).

---

## 5. Troubleshooting & Pitfall Resolution

| Symptom / Issue | Root Cause | Resolution |
| :--- | :--- | :--- |
| **`UnicodeEncodeError: 'charmap'` when running `az acr build`** | Windows CLI default codepage (`cp1252`) fails to print Next.js triangle character (`▲`). | Set `$env:PYTHONIOENCODING="utf-8"` in PowerShell before invoking `az acr build`. |
| **Container times out on cold start (HTTP 504 / 502)** | Docker image pull or Next.js cold start takes ~60-90s on basic App Service tier. | Verify `WEBSITES_PORT=8080` is configured in App Settings and inspect logs via `az webapp log tail`. |
| **`MissingResourceException: capacitor.settings.gradle`** | Android Gradle build was run before running Capacitor sync. | Run `npx cap sync android` first, which creates `capacitor.settings.gradle` and asset manifests. |
| **ZipDeploy `EINVAL: invalid argument` on Linux Kudu** | Windows backslashes (`\`) generated by PowerShell `Compress-Archive` corrupt Linux paths. | Deploy via Docker container (`Dockerfile` + ACR) rather than ZipDeploy to guarantee clean POSIX filesystem paths. |
| **PWA installation banner does not appear on desktop** | Browser requires HTTPS and a valid `manifest.json` + Service Worker. | Azure Web Apps provide built-in HTTPS; ensure `public/manifest.json` and `public/sw.js` are reachable. |

---

## 6. Operational URLs & Resources Reference

- **Production URL:** [https://swifload-cbe.azurewebsites.net](https://swifload-cbe.azurewebsites.net)
- **Azure Portal Resource Group:** `rg-swifload` (Region: `centralindia`)
- **Azure Container Registry:** `acrswifload.azurecr.io`
- **Customer APK Download:** `https://swifload-cbe.azurewebsites.net/downloads/SwifLoad-Customer.apk`
- **Driver APK Download:** `https://swifload-cbe.azurewebsites.net/downloads/SwifLoad-Driver.apk`
- **PWA / Mobile Distribution Portal:** `https://swifload-cbe.azurewebsites.net/downloads`
