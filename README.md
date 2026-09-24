# ⚡ SwifLoad - On-Demand City Logistics Mobile Solution

SwifLoad is an on-demand intra-city freight and goods-transport marketplace solution built for Android, iOS, and Web. Designed specifically for Indian urban logistics hubs (configured for Bengaluru Starter MVP), SwifLoad connects shippers/customers with verified driver-partners across multiple vehicle classes, backed by an operations command center.

---

## 🏗️ Architecture & Modules

### 1. 🌐 SwifLoad Web Platform (Porter.in Style)
- **Porter-Style Hero Booking & Fare Widget**:
  - Interactive multi-tab booking widget for **City Trucks** (Tata Ace, 3-Wheeler, Bolero), **2-Wheeler Express Courier**, **Packers & Movers**, and **Live Tracking**.
  - Bangalore landmark autocomplete (Koramangala, Indiranagar, HSR, Whitefield, Peenya, MG Road).
  - Dynamic route distance and urban traffic travel duration calculation with live fare breakdowns (Base + Distance + GST + Loading Helper).
  - Direct dispatch creation synchronized across all applications and simulators in real time.
- **Packers & Movers Relocation Suite**:
  - Interactive home size calculator (1 BHK, 2 BHK, 3 BHK, Villa) with add-on options (bed/wardrobe carpentry dismantling and 3-layer bubble wrap packaging).
- **Interactive Fleet Comparison Matrix**:
  - Side-by-side vehicle comparison with payload capacity, cargo bed dimensions, starting rates, and 1-click booking selection.
- **SwifLoad Enterprise & B2B Logistics**:
  - Interactive Fleet ROI Calculator comparing captive fleet costs vs on-demand dispatching (~35% cost reduction).
  - Centralized invoicing, SLA guarantees, REST APIs & Webhook integrations.
- **Driver-Partner ("Drive with Us") Portal**:
  - Transparent earnings potential calculator (up to ₹48,000/mo) and interactive partner registration wizard.
- **Live Consignment Tracking Drawer**:
  - Interactive Leaflet GPS map tracking, dual OTP handshakes (Pickup OTP & Delivery OTP), and driver calling bridge.
- **Prohibited Items Policy & Trust Metrics**:
  - Strict compliance with Indian transport regulations and safety mandates.

### 2. 📱 Customer / Shipper App
- **Phone Login & Profile**: Mobile-number authentication simulation, saved business/home addresses, and profile overview.
- **Dynamic Map & Route Selection**: Interactive Bangalore map with landmark lookup (Koramangala, Indiranagar, HSR Layout, Whitefield, MG Road, Peenya), pin placement, route distance calculation (with city road factor), and ETA estimation.
- **Fleet Category Selection**:
  - **2-Wheeler (Bike)**: Up to 20kg (couriers, parcels, food/documents)
  - **3-Wheeler (Cargo Auto)**: Up to 500kg (retail boxes, crates)
  - **Tata Ace (Chota Hathi)**: Up to 1000kg (furniture, electronics, house shifting)
  - **8ft Large Pickup (Bolero)**: Up to 1700kg (heavy equipment, machinery)
- **Cargo & Helper Configuration**: Goods category, approx. weight, loading/unloading helper assistance toggle, recipient name and contact.
- **Transparent Upfront Fare Engine**: Dynamic calculation including base fare, per-km rates, loading fees, 5% GST, and zone surge multipliers.
- **Scheduled or Instant Dispatch**: On-demand dispatching or advance booking scheduling.
- **Real-Time Live Driver Tracking**: Live GPS telemetry with animated driver progress along route.
- **Security OTP Handover**: Dual OTP verification—4-digit Pickup OTP for loading and 4-digit Drop OTP for delivery confirmation.
- **Privacy-Safe Virtual Calling & WhatsApp**: Masked phone bridge and instant support links.
- **Payments**: UPI (GPay, PhonePe, Paytm), Netbanking IMPS, and Cash on Delivery (COD).
- **Invoicing & History**: Downloadable GST tax invoices, trip history, and driver ratings/reviews.

---

### 2. 🚚 Driver-Partner App
- **Driver Onboarding & Document Verification**: KYC uploads for Commercial Driving Licence, Vehicle RC Book, Insurance Policy, and Aadhaar card.
- **Online / Offline Availability Toggle**: Instant status toggle with driver presence broadcasting.
- **Nearby Trip Request Overlay**: 30-second countdown offer screen showing guaranteed upfront earnings, pickup/drop addresses, distance, and goods category.
- **In-App Google Maps Deep Link**: One-tap launch into Google Maps turn-by-turn navigation directly to pickup or drop coordinates.
- **Trip Workflow State Machine**:
  - *Arrive at Pickup* ➔ *Verify Pickup OTP* ➔ *Start Trip* ➔ *Arrive at Drop* ➔ *Verify Delivery OTP & Photo Proof* ➔ *Confirm Delivery & Collect Payment*.
- **Driver Wallet & Daily Earnings**: Instant IMPS payout requests, wallet ledger, today's earnings, and trip history.
- **Driver Transparency**: Upfront transparent payout per order, cancellation protection, and 24/7 SOS helpline.

---

### 3. 🛡️ Operations Admin Portal
- **Role-Based Access Control (RBAC)**: Super Admin, Dispatcher, Support, and Finance roles.
- **Live Dispatch Board**: Real-time order monitoring with filters by status, area, and vehicle type.
- **Manual Dispatch & Driver Reassignment**: Override auto-matching to manually assign an active booking to any idle driver.
- **Driver & Vehicle KYC Approval**: Document inspection suite to approve or reject pending driver applications.
- **Dynamic Pricing Engine**: Live modification of base fares, per-km rates, waiting charges, and helper fees.
- **Bengaluru Serviceability Zones & Surge Management**: Geofenced coverage circles (Central, South, East, North, West) with configurable surge multipliers.
- **Live Fleet Radar Map**: Real-time map displaying all online drivers and designated service zones.
- **Financial Reconciliation**: GMV tracking, 18% platform take-rate, driver earnings, and GST ledgers.
- **CSV Data Export**: One-click export for Trips, Driver rosters, and Finance records.
- **Audit Trail**: Real-time event log recording all system state transitions and administrative overrides.

---

## 🚀 Running the Project

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or yarn

### Quick Start
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Multi-View Simulation
The top bar provides instant switching between:
- **Customer App**: Test booking, vehicle selection, and real-time shipment tracking in a sleek phone frame.
- **Driver-Partner App**: Switch online, accept incoming dispatches, enter OTPs, and manage earnings.
- **Operations Admin Portal**: Full-screen command desk for dispatch, pricing, KYC, and financial reports.
- **Dual Live Sim**: Side-by-side view of Customer and Driver apps to test end-to-end trip execution with synchronized state!

---

## 📱 Mobile Packaging (Android & iOS)

This project is configured with **Capacitor** for native mobile deployment:

```bash
# Build production web bundle
npm run build

# Sync web assets to Capacitor native projects
npm run cap:sync

# Open Android Studio to build APK / AAB
npm run cap:android

# Open Xcode to build iOS app
npm run cap:ios
```

---

## 📂 Codebase Structure
- [`src/components/Website/WebPlatform.tsx`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/components/Website/WebPlatform.tsx): Porter-style web portal container connecting all sections, fare widgets, and modals.
- [`src/components/Website/HeroBookingWidget.tsx`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/components/Website/HeroBookingWidget.tsx): Interactive tabbed booking widget for City Trucks, 2-Wheelers, Packers & Movers, and live tracking.
- [`src/components/Website/LiveTrackingModal.tsx`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/components/Website/LiveTrackingModal.tsx): Interactive Leaflet GPS tracking drawer with live driver telemetry and OTP handshakes.
- [`src/components/Website/PackersMoversSection.tsx`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/components/Website/PackersMoversSection.tsx): Complete home shifting quotation calculator with bubble wrap and carpentry add-ons.
- [`src/components/Website/EnterpriseSection.tsx`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/components/Website/EnterpriseSection.tsx): Enterprise B2B logistics hub with interactive captive fleet vs on-demand ROI calculator.
- [`src/components/Website/DriverPartnerSection.tsx`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/components/Website/DriverPartnerSection.tsx): Driver recruitment portal with earnings projections and instant KYC registration.
- [`src/components/Website/FleetComparison.tsx`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/components/Website/FleetComparison.tsx): Side-by-side vehicle specs matrix (payload, cargo dimensions, base and km rates).
- [`src/components/Customer/CustomerApp.tsx`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/components/Customer/CustomerApp.tsx): Customer mobile interface.
- [`src/components/Driver/DriverApp.tsx`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/components/Driver/DriverApp.tsx): Driver partner mobile interface.
- [`src/components/Admin/AdminPortal.tsx`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/components/Admin/AdminPortal.tsx): Operations admin web portal.
- [`src/components/Map/LeafletMap.tsx`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/components/Map/LeafletMap.tsx): Interactive Leaflet map with custom vehicle & route markers.
- [`src/context/LogisticsContext.tsx`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/context/LogisticsContext.tsx): Synchronized state store with live GPS simulation and localStorage persistence.
- [`src/lib/data.ts`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/lib/data.ts): Bangalore landmarks, initial driver fleet, active test trips, and zone configurations.
- [`src/lib/pricing.ts`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/src/lib/pricing.ts): Distance calculation, road tortuosity factor, and dynamic fare engine.
- [`capacitor.config.ts`](file:///G:/bobby/GitHub/SwifLoad-geminiFlash3.8/capacitor.config.ts): Native mobile wrapper configuration.
