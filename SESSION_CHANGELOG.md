# 📋 SwifLoad — Session Changelog

This document tracks all technical updates, architectural additions, and feature implementations made in each development session across any LLM model.

---

## 📅 Session: 2026-09-26 (Graphify & Archify Knowledge & Architectural Sync)

### Objectives
1. Update `graphify-out/` folder using `graphify` code-only AST extraction and cluster regeneration to reflect current code abstractions and data models.
2. Update `docs/` folder diagrams (`swifload-architecture`, `swifload-booking-fulfillment-workflow`, `swifload-trip-dispatch-sequence`, `swifload-telemetry-state-dataflow`, and `swifload-trip-state-lifecycle`) using `archify` to capture latest features:
   - Configurable distance slab rates across 4 customer tiers.
   - Driver approach distance charging and farthest-driver transparent quote locking.
   - Cascading group dispatch with driver identity shielding.
   - Fluid Leaflet telematics glide and dynamic polyline switching.
   - 3-track referral bonus programs and driver overdraft governance.
3. Validate and deliver all 5 Archify diagrams with 100% showcase acceptance (9/9 checks, 0 errors, 0 warnings).

---

### Key Changes & Bullet Points

#### 1. Graphify Knowledge Graph Refresh (`graphify-out/`)
- Executed `graphify extract . --code-only` followed by `graphify cluster-only .`
- Re-indexed 23 modified code files and pruned stale references, updating `graphify-out/graph.json` (222 nodes, 412 edges, 16 communities) and `graphify-out/graph.html`.
- Updated `graphify-out/GRAPH_REPORT.md` reflecting new primary God Nodes: `calculateCustomerQuotedSlabFare()`, `LogisticsContextType`, `CustomerType`, `calculateDistanceKm()`, and `LogisticsProvider()`.

#### 2. Archify Interactive Architectural Documentation (`docs/`)
- **Architecture Diagram (`docs/swifload-architecture.json` & `.html`):**
  - Updated revision to commit `7515f5aeca57876525277c26484052b09dbcad64`.
  - Updated component sublabels and cards to reflect Distance Slab Rates, 4 customer tiers, driver approach distance charging, cascading group dispatch, driver overdraft governance, and 3-track referral programs in Coimbatore.
  - Showcase validation: 9/9 checks passed, 0 errors, 0 warnings.
- **Workflow Diagram (`docs/swifload-booking-fulfillment-workflow.json` & `.html`):**
  - Updated multi-lane flow with slab pricing engine, cascading cluster group dispatch (15s cascade countdown), driver approach payout, continuous live transit glide, and wallet settlement with overdraft verification.
  - Showcase validation: 9/9 checks passed, 0 errors, 0 warnings.
- **Sequence Diagram (`docs/swifload-trip-dispatch-sequence.json` & `.html`):**
  - Updated message flows between Customer, CustomerApp, LogisticsContext, PricingEngine, DriverApp, and localStorage for farthest-driver slab quote locking, cascading dispatch countdown ping, OTP verification, and 82% net wallet deposit.
  - Showcase validation: 9/9 checks passed, 0 errors, 0 warnings.
- **Data Flow Diagram (`docs/swifload-telemetry-state-dataflow.json` & `.html`):**
  - Updated 5-stage data processing pipeline tracing 1.3s CSS vehicle glide telematics, dynamic pickup/drop routing polylines, slab tariff configurations, reducer state synchronization, and Leaflet radar rendering.
  - Showcase validation: 9/9 checks passed, 0 errors, 0 warnings.
- **Lifecycle Diagram (`docs/swifload-trip-state-lifecycle.json` & `.html`):**
  - Updated state transitions with cascading broadcast, fluid vehicle glide, overdraft validation during financial audits, and deterministic terminal exits.
  - Showcase validation: 9/9 checks passed, 0 errors, 0 warnings.
- **Delivery Summary Document (`docs/Archify_26Sep2026_Updated.txt`):**
  - Documented updated specifications, hashes, verification results, and scope descriptions.

---

### Verification Status
- **Build Command:** `npm run build`
- **Result:** Compiled successfully with 0 TypeScript and Next.js errors.
- **Static Page Generation:** 4/4 static pages generated successfully (`/`, `/_not-found`).
- **Archify Validation:** 5/5 diagrams passed showcase quality checks with 9/9 checks, 0 composition errors, and 0 warnings.

---

## 📅 Session: 2026-09-26

### Objectives
1. Implement configurable Distance Slab Rates system (0-1 km flat minimum price, 1-3 km incremental, 3-5 km incremental, etc.) across 4 customer categories: *New Customer*, *Regular Customer*, *Multiple Pickup Location Customer*, and *Corporate Customer*.
2. Implement driver distance charging logic: driver app popup shows charges based on distance from driver's location to customer pickup + drop location (e.g. 1 km away = ₹68, 2 km away = ₹74 for a 3 km trip).
3. Implement customer quote calculation based on the farthest driver in closest range to avoid customer surprise price jumps, along with an explicit transparent pricing disclaimer.
4. Implement 3-track Referral Bonus program with configurable rewards in Admin Portal and direct wallet credits: Driver referring Driver (₹500), Driver referring Customer (₹100), and Customer referring Customer (₹150 referrer / ₹100 referee).
5. Implement Wallet Facilities for both Drivers and Customers:
   - Negative balance allowed **only for drivers** up to a pre-determined limit fixed for each driver (configurable in Admin Portal).
   - Customer wallets strictly enforce zero-negative balance policy.

---

### Key Changes & Bullet Points

#### 1. Distance Slab Rates & Pricing Engine
- **Data Models (`src/types/logistics.ts`):**
  - Added `CustomerType` (`'new_customer' | 'regular' | 'multiple_pickup' | 'corporate'`).
  - Added `DistanceSlab`, `CustomerTypeSlabConfig`, `SlabBreakdownItem`, and updated `FareBreakdown` with slab details and customer price notice.
- **Slab Defaults (`src/lib/data.ts`):**
  - Configured `DEFAULT_CUSTOMER_SLABS` matching prompt math (0–1 km: ₹50 flat; 1–3 km: ₹6/km; 3–5 km: ₹6/km; >5 km: ₹8/km).
- **Pricing Calculation Engine (`src/lib/pricing.ts`):**
  - `calculateSlabDistanceFare`: Tiered slab calculator handling flat minimum base rate and incremental per-km charges.
  - `calculateCustomerQuotedSlabFare`: Calculates customer quote based on the farthest driver in pickup range to prevent unexpected rate increases, including the transparent pricing disclaimer.
  - `calculateDriverTaskPayout`: Computes billable distance as driver distance to pickup + trip distance, returning gross fare, 18% commission deduction, net take-home earnings, and slab breakdown pills.
- **Admin Configuration Sandbox (`src/components/Admin/AdminPortal.tsx`):**
  - Added **Distance Slab Rates** tab with customer category selector, slab edit/add modals, and a **Live Slab Pricing Simulation Sandbox** testing the exact ₹68 (1 km away) vs. ₹74 (2 km away) requirement.

#### 2. Three-Track Referral Bonus Programs
- **Program Configuration & Tracking (`src/types/logistics.ts`, `src/lib/data.ts`, `src/context/LogisticsContext.tsx`):**
  - Added `ReferralProgramConfig` (Driver-to-Driver ₹500, Driver-to-Customer ₹100, Customer-to-Customer ₹150/₹100) and `ReferralRecord`.
  - Added actions `submitReferral`, `claimReferralBonus`, and `applyCustomerReferralCode`.
- **Admin Management (`src/components/Admin/AdminPortal.tsx`):**
  - Added **Referral Programs** tab with 3-track bonus rate controls, statistics cards, and full referral ledger with manual bonus approval / wallet credit actions.
- **Customer Refer & Earn Tab (`src/components/Customer/CustomerApp.tsx`):**
  - Added dedicated Refer & Earn tab with unique shareable customer code, bonus breakdown, invite code entry field, and referral history table.
- **Driver Refer & Earn Tab (`src/components/Driver/DriverApp.tsx`):**
  - Added driver referral portal supporting both driver invites (₹500 on KYC verification) and merchant invites (₹100 on first completed booking).
  - Added referral code input in driver onboarding registration modal.

#### 3. Wallet Facilities & Driver Overdraft Governance
- **Driver Wallet with Overdraft (`src/types/logistics.ts`, `src/components/Driver/DriverApp.tsx`):**
  - Seeded drivers with negative balance (`drv_05` with -₹350 balance and ₹1,500 limit).
  - Dedicated driver wallet tab displaying negative balance alert, approved overdraft cushion, and recharge/clear dues modal via UPI.
  - Commission deduction in `LogisticsContext.tsx` checks driver overdraft threshold, preventing trips if the driver exceeds their limit.
- **Customer Wallet (`src/components/Customer/CustomerApp.tsx`):**
  - Zero-negative balance policy enforced: trips cannot be booked if wallet balance is insufficient.
  - Top-up modal allowing instant wallet credit via UPI/NetBanking.
  - Wallet payment method option available during checkout.
- **Admin Wallet Governance (`src/components/Admin/AdminPortal.tsx`):**
  - Added **Marketplace Wallets** tab listing all driver balances, overdraft utilization, limit configuration modals, and customer wallet top-ups.
  - Full audit ledger modal inspecting chronological transactions with timestamps, amounts, categories, and references.

#### 4. Booking Widgets Integration
- **`src/components/Website/HeroBookingWidget.tsx`:**
  - Integrated slab pricing quotes with transparent pricing notice and wallet payment options.

#### 5. Customer App Category Heading Split Layout
- **`src/components/Customer/CustomerApp.tsx`:**
  - Resolved category label truncation by adopting a vertically balanced layout:
    - **Top portion:** Displays the primary heading above the icon (`Corporate`, `Multi`, `New`, `Regular`).
    - **Center:** Standardized 28×28px (`w-7 h-7`) icon badge (`🏢`, `📍`, `✨`, `👤`).
    - **Bottom portion:** Displays the secondary portion below the icon when lengthy (`B2B`, `Pickup`, `User`), while maintaining uniform slot height with an invisible placeholder for non-lengthy categories (`Regular`).
  - All 4 category cards now share identical `min-h-[82px]` heights, identical icon centerlines, and 100% visible text without truncation.

---

### Verification Status
- **Command:** `npm run build`
- **Result:** Successfully compiled with 0 TypeScript and Next.js errors.
- **Static Page Generation:** 4/4 static pages generated successfully (`/`, `/_not-found`).

---

## 📅 Session: 2026-09-25

### Objectives
1. Implement real-time driver live movement towards customer pickup and drop locations (Uber-like continuous map tracking).
2. Implement Cascading Group Dispatch engine: divide drivers into location clusters, nearest group gets first offer popup, unaccepted orders cascade sequentially to adjacent groups after 15–20s countdown, and shield driver contact details until accepted.
3. Switch default platform city from Bengaluru to Coimbatore, Tamil Nadu across data, landmarks, service zones, driver registrations, invoices, landing page, and pricing engine.
4. Establish persistent repository instruction requiring all AI models in every session to update session changes before exiting.

---

### Key Changes & Bullet Points

#### 1. Live Uber-like Driver Movement & Telematics
- **Fluid CSS Glide (`globals.css`):**
  - Added `.leaflet-driver-marker` with `transition: transform 1.3s cubic-bezier(0.2, 0.8, 0.4, 1)` for smooth vehicle gliding between GPS ticks without visual jumping.
- **Decoupled Leaflet Canvas (`src/components/Map/LeafletMap.tsx`):**
  - Stored driver marker reference in `driverMarkerRef` and updated position via `marker.setLatLng()` without destroying map layers or invoking `fitBounds` on every tick.
  - Added dynamic `targetDestination` (`'pickup'` | `'drop'`) prop:
    - Approaching pickup (`ARRIVING_PICKUP`): connects Driver ➔ Pickup via solid amber polyline (`#f59e0b`), with dashed planned line from Pickup ➔ Drop.
    - Approaching drop (`IN_TRANSIT`): dynamically re-routes solid polyline directly from Driver ➔ Drop in emerald (`#10b981`).
- **Simulated GPS Mover (`src/context/LogisticsContext.tsx`):**
  - Built continuous 1.5-second tick loop that calculates vector coordinates $(dLat, dLng)$ and advances active drivers towards pickup or drop.
  - Implemented automatic geofence arrival detection: within 50 meters, automatically flips status to `AT_PICKUP` or `ARRIVED_DESTINATION`.
- **Customer Live ETA Banner (`src/components/Customer/CustomerApp.tsx`):**
  - Added floating real-time telemetry card displaying remaining distance in km and arrival ETA in minutes.
  - Shielded driver contact details and phone number while in `SEARCHING` status; automatically reveals name, vehicle number, masked call button, and WhatsApp button upon driver acceptance.

#### 2. Cascading Group Dispatch System
- **Driver Clusters & Group Data (`src/types/logistics.ts`, `src/lib/data.ts`):**
  - Added `DriverGroup` interface and assigned `groupId`, `groupName`, and `locationRange` to all driver partners.
  - Defined 5 regional clusters (Central, East, South, South-East, North).
- **Proximity-Based Cascading Engine (`src/context/LogisticsContext.tsx`):**
  - `createBooking` now calculates Euclidean distance to cluster centers and targets the closest group first.
  - Implemented 1-second countdown timer (`dispatchCountdownSecs`) that automatically escalates unaccepted orders to the next adjacent group.
  - Added `acceptTripByDriver` and `passTripToNextGroup` actions.
- **Incoming Task Modal & Available Orders (`src/components/Driver/DriverApp.tsx`):**
  - Driver header displays the assigned cluster group and location range.
  - Integrated incoming task alert popup displaying pickup, drop, driver earnings, gross fare, and countdown timer with **Accept Task** and **Pass to Next Group** buttons.
  - Added **"Available Orders for Your Group"** list under the trips tab for unaccepted orders before they cascade to the next cluster.

#### 3. Default City Migration: Bengaluru ➔ Coimbatore, Tamil Nadu
- **Landmarks & Coordinates (`src/lib/data.ts`, `src/components/Map/LeafletMap.tsx`):**
  - Defined `COIMBATORE_LANDMARKS` with real coordinates for Gandhipuram, RS Puram, Peelamedu (Tidel Park), Singanallur, Kurichi SIDCO, Ganapathy, Saravanampatti, Thudiyalur, and Coimbatore Airport (CJB).
  - Updated default map center to Coimbatore center (`11.0168, 76.9558`).
  - Added `BANGALORE_LANDMARKS = COIMBATORE_LANDMARKS` backward-compatibility alias.
- **Service Zones & Drivers (`src/lib/data.ts`):**
  - Created 5 Coimbatore operational service zones with PIN codes (641001–641045).
  - Updated driver partners with Tamil Nadu registration plates (`TN-38-AX-4821`, `TN-37-BY-9102`, `TN-66-AB-7712`, etc.) and local Coimbatore names.
  - Set default active trip to `trip_cbe_1001` (Peelamedu Tidel Park to Gandhipuram along Avinashi Road).
- **Logistics Context (`src/context/LogisticsContext.tsx`):**
  - Updated default customer profile to Coimbatore (`Kavitha Sundaram`, Sundaram Engineering & Spares).
  - Bumped localStorage keys to `v2_cbe` to ensure immediate fresh city state in the browser.
- **Customer & Driver Portals (`src/components/Customer/CustomerApp.tsx`, `src/components/Driver/DriverApp.tsx`, `src/components/Admin/AdminPortal.tsx`):**
  - Updated headings, badges, and support text to Coimbatore Hub, Tamil Nadu.
  - Updated tax invoice details with Tamil Nadu GSTIN prefix (`33AAACS8192K1Z5`).
  - Driver registration form updated to Tamil Nadu RTO compliance format (`TN-37 / TN-38 / TN-66`).
- **Landing Page & Routing Engine (`src/components/Website/*`, `src/lib/pricing.ts`):**
  - Default city in navbar, hero booking widget, fleet comparison, reviews, enterprise, packers & movers, and footer set to Coimbatore.
  - Adjusted urban tortuosity factor to `1.25x` and transit speed to `22-26 km/h` for Coimbatore.

---

### Verification
- Production build verified via `npm run build` with **0 errors**.
