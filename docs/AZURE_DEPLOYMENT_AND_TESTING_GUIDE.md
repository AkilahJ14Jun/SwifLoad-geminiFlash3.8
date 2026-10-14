# 📘 SwifLoad — Azure Cloud Deployment & Testing Procedure Guide

> **Production Cloud URL:** [`https://swifload-cbe.azurewebsites.net/`](https://swifload-cbe.azurewebsites.net/)  
> **Target Region:** `centralindia` | **Resource Group:** `rg-swifload`  
> **Azure Container Registry:** `acrswifload.azurecr.io`  
> **App Service Plan:** `plan-swifload` (Linux B1)  

---

## 📑 Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Step-by-Step Deployment Procedure](#3-step-by-step-deployment-procedure)
   - [Phase 1: Local Codebase Build & Verification](#phase-1-local-codebase-build--verification)
   - [Phase 2: Android APK Compilation & Dual-Flavor Signing](#phase-2-android-apk-compilation--dual-flavor-signing)
   - [Phase 3: Docker Container Cloud Build in ACR](#phase-3-docker-container-cloud-build-in-acr)
   - [Phase 4: Azure App Service Container Activation & Restart](#phase-4-azure-app-service-container-activation--restart)
4. [Step-by-Step Testing & Acceptance Verification](#4-step-by-step-testing--acceptance-verification)
   - [Test 1: App Service Warm-Up & Health Check](#test-1-app-service-warm-up--health-check)
   - [Test 2: Web Route & Application Portals Verification](#test-2-web-route--application-portals-verification)
   - [Test 3: Mobile APK Download & Signature Verification](#test-3-mobile-apk-download--signature-verification)
   - [Test 4: Real-Time Multi-Client State Synchronization Test](#test-4-real-time-multi-client-state-synchronization-test)
   - [Test 5: Complete End-to-End Operational Lifecycle Test](#test-5-complete-end-to-end-operational-lifecycle-test)
5. [Troubleshooting & Operational Runbook](#5-troubleshooting--operational-runbook)

---

## 1. Overview & Architecture

SwifLoad runs as a containerized Next.js 14 application on Azure App Service for Linux, backed by a persistent server database and real-time Server-Sent Events (SSE) broadcaster.

```
                           +----------------------------------------+
                           |          Microsoft Azure Cloud         |
                           |       Resource Group: rg-swifload      |
                           +----------------------------------------+
                                                |
                       +------------------------+------------------------+
                       |                                                 |
         +----------------------------+                    +----------------------------+
         |  Azure Container Registry  |                    |     Azure App Service      |
         |   acrswifload.azurecr.io   |    Docker Pull     |        (Linux B1)          |
         |    swifload:v3 / latest    | -----------------> |       swifload-cbe         |
         +----------------------------+                    |   Port: 8080 (Standalone)  |
                       ^                                   +----------------------------+
                       | az acr build                                    |
         +----------------------------+                    +-------------+-------------+
         |     Local Workspace        |                    |                           |
         |  - Standalone Next.js      |             REST & SSE APIs             Public Downloads
         |  - Pre-built Signed APKs   |            (/api/state, /events)      (/downloads/*.apk)
         +----------------------------+                    |                           |
                       |                                   v                           v
              Gradle Assemble                 +-------------------------+ +-------------------------+
                       v                      | Web Portals (Responsive)| | Mobile Native Android   |
         +----------------------------+       | - Customer (/customer)  | | - SwifLoad-Customer.apk |
         | Customer & Driver APKs     | ----> | - Driver (/driver)      | | - SwifLoad-Driver.apk   |
         | (v1+v2 Keystore Signatures)|       | - Ops Admin (/admin)    | | (Point to Cloud URL)    |
         +----------------------------+       +-------------------------+ +-------------------------+
```

---

## 2. Prerequisites & Environment Setup

Before executing a deployment, verify that the following tools are installed and configured:

1. **Azure CLI:**
   ```powershell
   az --version
   # Confirm login to target subscription
   az account show
   # If not logged in:
   az login
   az account set --subscription "53f8852d-7390-4daf-8cc4-4e53e1769fb2"
   ```

2. **Java Development Kit 17 (JDK 17):**
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
   java -version
   ```

3. **Node.js & NPM:**
   ```powershell
   node -v   # v20+
   npm -v    # v10+
   ```

4. **Android SDK Build-Tools (for apksigner verification):**
   Located at `G:\Android\Sdk\build-tools\34.0.0` or in system `PATH`.

---

## 3. Step-by-Step Deployment Procedure

### Phase 1: Local Codebase Build & Verification

Before building native apps or Docker containers, verify that the Next.js TypeScript code compiles cleanly:

```powershell
# In project root: G:\bobby\GitHub\SwifLoad-geminiFlash3.8
npm run build
```

* **Expected Output:**
  * `✓ Compiled successfully`
  * `✓ Generating static pages (8/8)`
  * `Exit code: 0` with 0 type or lint errors.

---

### Phase 2: Android APK Compilation & Dual-Flavor Signing

The mobile applications are built as separate native Android product flavors:
- **Customer Flavor:** `com.swifload.customer` (targets `https://swifload-cbe.azurewebsites.net/customer`)
- **Driver Flavor:** `com.swifload.driver` (targets `https://swifload-cbe.azurewebsites.net/driver`)

Both flavors are signed with `swifload-release.keystore` using Android 11+ required **v1 and v2 Signature Schemes**.

#### Step 2.1: Run the Automated APK Build & Sign Script
Execute the repository build script:

```powershell
python scripts/rebuild_apks.py
```

#### Step 2.2: What the Script Executes Internally
1. Invokes Gradle wrapper in `android/`:
   ```powershell
   Push-Location "android"
   $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
   .\gradlew.bat assembleCustomerRelease assembleDriverRelease
   Pop-Location
   ```
2. Copies generated binaries to public distribution paths:
   ```powershell
   Copy-Item "android/app/build/outputs/apk/customer/release/app-customer-release.apk" "public/downloads/SwifLoad-Customer.apk" -Force
   Copy-Item "android/app/build/outputs/apk/driver/release/app-driver-release.apk" "public/downloads/SwifLoad-Driver.apk" -Force
   ```
3. Verifies cryptographic signatures using `apksigner`:
   ```powershell
   & "G:\Android\Sdk\build-tools\34.0.0\apksigner.bat" verify -v "public/downloads/SwifLoad-Customer.apk"
   & "G:\Android\Sdk\build-tools\34.0.0\apksigner.bat" verify -v "public/downloads/SwifLoad-Driver.apk"
   ```
   *Expected Output:* `Verifies (v1: true, v2: true)`.

---

### Phase 3: Docker Container Cloud Build in ACR

The container image packages the Next.js standalone server along with the `public/` directory (including the fresh APK binaries). To avoid Windows-to-Linux path issues, the Docker build is executed directly inside Azure Container Registry.

#### Step 3.1: Set Output Encoding & Trigger Cloud Build
```powershell
# Set UTF-8 to prevent charmap errors with Next.js build characters (▲)
$env:PYTHONIOENCODING = "utf-8"

# Trigger cloud build with semantic tag and latest tag
az acr build --registry acrswifload --image swifload:latest --image swifload:v3 .
```

#### Step 3.2: Verify Build Run Status
```powershell
az acr task list-runs --registry acrswifload --output table
```
* **Expected Result:** The top run ID (e.g. `cu5`) reports `STATUS: Succeeded`.

#### Step 3.3: Verify Image Tags in Registry
```powershell
az acr repository show-tags --name acrswifload --repository swifload --output table
```
* **Expected Result:** Tags `latest` and `v3` are present.

---

### Phase 4: Azure App Service Container Activation & Restart

#### Step 4.1: Retrieve Container Registry Admin Credentials
```powershell
$creds = az acr credential show --name acrswifload | ConvertFrom-Json
$adminUser = $creds.username
$adminPass = $creds.passwords[0].value
```

#### Step 4.2: Update Web App Container Configuration
Point the web app to the newly tagged container image:
```powershell
az webapp config container set `
  --name swifload-cbe `
  --resource-group rg-swifload `
  --container-image-name acrswifload.azurecr.io/swifload:v3 `
  --container-registry-url https://acrswifload.azurecr.io `
  --container-registry-user $adminUser `
  --container-registry-password $adminPass
```

#### Step 4.3: Ensure App Service Environment Settings
Verify that the inbound port is set to `8080`:
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

#### Step 4.4: Restart Web App to Pull the Container
```powershell
az webapp restart --name swifload-cbe --resource-group rg-swifload
```
> **Note:** Allow 30–45 seconds for Azure App Service to pull the image and initialize the container.

---

## 4. Step-by-Step Testing & Acceptance Verification

Follow these sequential steps to thoroughly test the deployment.

### Test 1: App Service Warm-Up & Health Check
Verify the container has pulled and the web server is answering requests:
```powershell
$res = Invoke-WebRequest -Uri "https://swifload-cbe.azurewebsites.net/" -UseBasicParsing -TimeoutSec 30
Write-Host "HTTP Status: $($res.StatusCode), Size: $($res.RawContentLength) bytes"
```
* **Pass Criteria:** Returns `HTTP Status: 200` with payload ~95 KB.

---

---

### Test 2: Complete Live Endpoints Verification Suite

Execute this automated PowerShell test script to verify all 14 frontend routes, backend REST API endpoints, PWA manifests, and APK binaries on the live cloud instance:

```powershell
$baseUrl = "https://swifload-cbe.azurewebsites.net"

# 1. Frontend Web Portals & PWA Assets
$getEndpoints = @(
  @{ Path = "/";                       Desc = "Landing Page" },
  @{ Path = "/customer";               Desc = "Customer Web Portal" },
  @{ Path = "/driver";                 Desc = "Driver Terminal" },
  @{ Path = "/admin";                  Desc = "Operations Admin" },
  @{ Path = "/downloads";              Desc = "Mobile Downloads Hub" },
  @{ Path = "/api/state";              Desc = "State Snapshot API" },
  @{ Path = "/api/trips";              Desc = "Trips Resource (GET)" },
  @{ Path = "/api/drivers";            Desc = "Drivers Resource (GET)" },
  @{ Path = "/manifest.json";          Desc = "Web App Manifest" },
  @{ Path = "/manifest-customer.json"; Desc = "Customer PWA Manifest" },
  @{ Path = "/manifest-driver.json";   Desc = "Driver PWA Manifest" },
  @{ Path = "/sw.js";                  Desc = "Service Worker" }
)

Write-Host "=== Testing GET Endpoints ===" -ForegroundColor Cyan
foreach ($ep in $getEndpoints) {
  $url = "$baseUrl$($ep.Path)"
  try {
    $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15
    Write-Host "[OK] $($res.StatusCode) : $($ep.Desc) -> $url ($($res.RawContentLength) bytes)" -ForegroundColor Green
  } catch {
    Write-Host "[FAIL] $($ep.Desc) -> $url : $_" -ForegroundColor Red
  }
}

# 2. REST Mutation Endpoints (POST)
Write-Host "`n=== Testing POST Mutation Endpoints ===" -ForegroundColor Cyan
try {
  $walletBody = @{ entityType = 'customer'; amount = 0; description = 'Healthcheck verification'; type = 'CREDIT' } | ConvertTo-Json
  $wRes = Invoke-RestMethod -Uri "$baseUrl/api/wallets" -Method Post -Body $walletBody -ContentType "application/json"
  Write-Host "[OK] POST /api/wallets : Success = $($wRes.success), Balance = $($wRes.wallet.balance)" -ForegroundColor Green
} catch {
  Write-Host "[FAIL] POST /api/wallets : $_" -ForegroundColor Red
}

# 3. APK Binaries (HEAD)
Write-Host "`n=== Testing APK Binary Downloads ===" -ForegroundColor Cyan
$apkFiles = @(
  @{ Path = "/downloads/SwifLoad-Customer.apk"; Desc = "Customer APK Binary" },
  @{ Path = "/downloads/SwifLoad-Driver.apk";   Desc = "Driver APK Binary" }
)

foreach ($apk in $apkFiles) {
  $url = "$baseUrl$($apk.Path)"
  try {
    $head = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing -TimeoutSec 15
    Write-Host "[OK] $($head.StatusCode) : $($apk.Desc) -> $url ($($head.Headers['Content-Length']) bytes)" -ForegroundColor Green
  } catch {
    Write-Host "[FAIL] $($apk.Desc) -> $url : $_" -ForegroundColor Red
  }
}
```

* **Pass Criteria Matrix:**

| Category | Endpoint / Path | Method | Expected Status | Expected Output / Size |
| :--- | :--- | :--- | :--- | :--- |
| **Portals** | `/` | `GET` | `200 OK` | ~95 KB HTML payload |
| **Portals** | `/customer` | `GET` | `200 OK` | ~43 KB HTML payload |
| **Portals** | `/driver` | `GET` | `200 OK` | ~36 KB HTML payload |
| **Portals** | `/admin` | `GET` | `200 OK` | ~23 KB HTML payload |
| **Portals** | `/downloads` | `GET` | `200 OK` | ~23 KB HTML payload |
| **REST APIs** | `/api/state` | `GET` | `200 OK` | Complete JSON database snapshot |
| **REST APIs** | `/api/trips` | `GET` | `200 OK` | Active trips list JSON |
| **REST APIs** | `/api/drivers` | `GET` | `200 OK` | Registered drivers list JSON |
| **REST APIs** | `/api/wallets` | `POST` | `200 OK` | `{ "success": true, "wallet": ... }` |
| **REST APIs** | `/api/config` | `POST` | `200 OK` | `{ "success": true, "db": ... }` |
| **Telemetry** | `/api/events` | `GET` | `200 OK` | Stream: `text/event-stream` (`: ping`) |
| **PWAs** | `/manifest*.json` | `GET` | `200 OK` | Valid JSON web manifests |
| **PWAs** | `/sw.js` | `GET` | `200 OK` | Valid JavaScript Service Worker |
| **Binaries** | `/downloads/SwifLoad-Customer.apk` | `HEAD`/`GET` | `200 OK` | ~2,979,228 bytes |
| **Binaries** | `/downloads/SwifLoad-Driver.apk` | `HEAD`/`GET` | `200 OK` | ~2,979,234 bytes |

---

### Test 3: Mobile APK Download & Signature Verification
Verify that the APK files hosted on Azure are accessible, correctly sized, and have valid signatures:

#### 3.1 HTTP Header & Size Verification:
```powershell
$apkUrls = @(
  'https://swifload-cbe.azurewebsites.net/downloads/SwifLoad-Customer.apk',
  'https://swifload-cbe.azurewebsites.net/downloads/SwifLoad-Driver.apk'
)

foreach ($url in $apkUrls) {
  $head = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing -TimeoutSec 15
  Write-Host "[OK] $($head.StatusCode) : $url (Length: $($head.Headers['Content-Length']) bytes)"
}
```
* **Pass Criteria:**
  * `SwifLoad-Customer.apk`: HTTP 200, Content-Length ~2,979,228 bytes.
  * `SwifLoad-Driver.apk`: HTTP 200, Content-Length ~2,979,234 bytes.

#### 3.2 Direct Download & Byte Verification:
```powershell
Invoke-WebRequest -Uri "https://swifload-cbe.azurewebsites.net/downloads/SwifLoad-Customer.apk" -OutFile "$env:TEMP\Customer-Test.apk"
& "G:\Android\Sdk\build-tools\34.0.0\apksigner.bat" verify -v "$env:TEMP\Customer-Test.apk"
Remove-Item "$env:TEMP\Customer-Test.apk"
```
* **Pass Criteria:** Returns `Verifies (v1: true, v2: true)`.

---

### Test 4: Real-Time Multi-Client State Synchronization Test
Verify that the central cloud database updates across multiple clients simultaneously via Server-Sent Events (SSE).

#### Step 4.1: Inject a Verification Trip via Cloud REST API
```powershell
$tripPayload = @{
  customerName = "Live Cloud Verification"
  customerPhone = "+91 94433 11223"
  pickupAddress = "Gandhipuram Central Bus Stand, Coimbatore"
  pickupLat = 11.0183
  pickupLng = 76.9644
  dropoffAddress = "RS Puram Post Office, Coimbatore"
  dropoffLat = 11.0094
  dropoffLng = 76.9452
  vehicleType = "3_WHEELER"
  paymentMethod = "ONLINE"
  baseFare = 150
  tax = 7.5
  totalFare = 157.5
} | ConvertTo-Json

$createdTrip = Invoke-RestMethod -Uri "https://swifload-cbe.azurewebsites.net/api/trips" -Method Post -Body $tripPayload -ContentType "application/json"
Write-Host "Created Trip ID: $($createdTrip.id), Status: $($createdTrip.status)"
```

#### Step 4.2: Verify Central Cloud State
```powershell
$state = Invoke-RestMethod -Uri "https://swifload-cbe.azurewebsites.net/api/state"
$found = $state.trips | Where-Object { $_.id -eq $createdTrip.id }
Write-Host "Trip verified in cloud state: $($found.pickupAddress) -> $($found.status)"
```

#### Step 4.3: Verify SSE Live Event Stream
Open PowerShell:
```powershell
$req = [System.Net.WebRequest]::Create("https://swifload-cbe.azurewebsites.net/api/events")
$resp = $req.GetResponse()
$stream = $resp.GetResponseStream()
$reader = New-Object System.IO.StreamReader($stream)
Write-Host "Connected to SSE stream. Waiting for heartbeat..."
$line = $reader.ReadLine()
Write-Host "Received SSE Line: $line"
$reader.Close()
$resp.Close()
```
* **Pass Criteria:** Receives `: ping` heartbeat comment or typed JSON event (`event: TRIP_CREATED`).

---

### Test 5: Complete End-to-End Operational Lifecycle Test

Perform this interactive user test in the browser or mobile devices:

1. **Customer Booking:**
   - Open [https://swifload-cbe.azurewebsites.net/customer](https://swifload-cbe.azurewebsites.net/customer).
   - Enter pickup & drop localities (e.g. Gandhipuram to Peelamedu).
   - Select vehicle category (`3-Wheeler` or `Tata Ace 1 Ton`).
   - Click **Book Now**.
   - Note the generated 4-digit pickup OTP.

2. **Driver Order Notification & Sliding Popup:**
   - In another browser tab/phone, open [https://swifload-cbe.azurewebsites.net/driver](https://swifload-cbe.azurewebsites.net/driver).
   - Click **'Welcome / Live Calls'** to view the live GPS driver radar.
   - Click **'Available Orders'**.
   - Confirm that the newly booked order slides into view as an incoming popup window with:
     - Total fare at the top.
     - Pickup locality with distance from driver `(X km)`.
     - Drop locality with distance from pickup `(Y km)`.
     - 10-second countdown timer.
   - Click **Accept Order**.

3. **Transit & 3-Minute Waiting Timer (Pickup):**
   - Click **Start Pickup**. Verify live transit timer starts and distance updates.
   - Click **Pickup point reached**.
   - Verify 3-minute waiting countdown starts. If waiting exceeds 3 minutes, confirm extra charges accrue simultaneously on both Driver and Customer screens.
   - Enter the 4-digit OTP to confirm pickup.

4. **Transit & 3-Minute Waiting Timer (Drop):**
   - Click **Start Drop**.
   - On reaching destination, click **Reached drop location** (or **Reached drop destination**).
   - Verify transit tracker stops and 3-minute unloading timer starts.
   - Enter the 4-digit drop OTP.

5. **Payment & Feedback:**
   - Display company payment QR code modal.
   - Driver submits customer rating & feedback.
   - Verify driver automatically routes back to the **Available Orders** terminal.

6. **Operations Admin Monitoring:**
   - Open [https://swifload-cbe.azurewebsites.net/admin](https://swifload-cbe.azurewebsites.net/admin).
   - Confirm the trip is updated to `COMPLETED` on the live dispatch radar and ledger.

---

## 5. Troubleshooting & Operational Runbook

| Issue / Symptom | Root Cause | Solution |
| :--- | :--- | :--- |
| **`UnicodeEncodeError: 'charmap'` during `az acr build`** | PowerShell default codepage (`cp1252`) fails to print Next.js UTF-8 symbol (`▲`). | Run `$env:PYTHONIOENCODING="utf-8"` before invoking `az acr build`. |
| **HTTP 504 / Cold Start Timeout on First Request** | Linux Basic B1 App Service takes 30-60s to pull Docker image and boot Next.js. | Wait 30 seconds after restart before checking URLs. Ensure `WEBSITES_PORT=8080` is set. |
| **APK fails to install with `"App not installed"` error** | Android 11+ enforces APK Signature Scheme v2; unsigned/v1-only APKs are rejected. | Always compile via `python scripts/rebuild_apks.py` which signs with both v1 and v2 using `swifload-release.keystore`. |
| **APK downloads an outdated version** | Browser cached old binary, or App Service container was not updated with the new tag. | Rebuild container with an explicit tag (e.g. `swifload:v3`), set container image in App Service, and restart. |
| **Capacitor Android build complains of missing settings** | `npx cap sync android` has not been run after modifying web assets. | Run `npx cap sync android` to refresh `android/` project configurations. |
