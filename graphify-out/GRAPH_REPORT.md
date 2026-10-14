# Graph Report - SwifLoad-geminiFlash3.8  (2026-10-14)

## Corpus Check
- 73 files · ~599,289 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 444 nodes · 851 edges · 33 communities (24 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0177ba5b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- LogisticsContext.tsx
- WebPlatform.tsx
- getDatabase
- dependencies
- compilerOptions
- 🌐 SwifLoad — Azure Cloud Infrastructure Architecture Guide
- generate_instagram_promo_v2.py
- SwifLoad Cloud Deployment & Operations Manual
- Two-Way Pickup and Delivery OTP Verification
- DriverApp.tsx
- devDependencies
- SwifLoad Project Overview
- manifest.json
- SwifLoad Architecture Diagram
- Bengaluru Setup and Hardware Cost Guide
- layout.tsx
- Software Outsourcing Cost Estimate
- next.config.mjs
- useLogistics
- 📘 SwifLoad — Azure Cloud Deployment & Testing Procedure Guide
- LeafletMap.tsx
- BookingSuccessModal.tsx
- DriverPartnerSection.tsx
- PackersMoversSection.tsx
- WebFooter.tsx
- End-to-End Shipper to Delivery Cycle
- Discrete Trip State Machine Transitions

## God Nodes (most connected - your core abstractions)
1. `useLogistics()` - 43 edges
2. `LogisticsContextType` - 23 edges
3. `getDatabase()` - 23 edges
4. `saveDatabase()` - 18 edges
5. `compilerOptions` - 16 edges
6. `broadcastEvent()` - 15 edges
7. `DatabaseSchema` - 14 edges
8. `calculateDistanceKm()` - 13 edges
9. `🌐 SwifLoad — Azure Cloud Infrastructure Architecture Guide` - 13 edges
10. `VehicleCategory` - 12 edges

## Surprising Connections (you probably didn't know these)
- `End-to-End Shipper to Delivery Cycle` --implements--> `CreateTripPayload`  [INFERRED]
  docs/swifload-booking-fulfillment-workflow.html → src/context/LogisticsContext.tsx
- `Customer Tariff Distance Slabs` --implements--> `calculateCustomerQuotedSlabFare()`  [INFERRED]
  Changes Required.txt → src/lib/pricing.ts
- `Shipper Customer Mobile App` --semantically_similar_to--> `Customer Logistics App Scope`  [INFERRED] [semantically similar]
  README.md → Initial Requirements.txt
- `Driver-Partner Mobile App` --semantically_similar_to--> `Driver-Partner App Scope`  [INFERRED] [semantically similar]
  README.md → Initial Requirements.txt
- `Operations Command Center Portal` --semantically_similar_to--> `Operations Admin Portal Scope`  [INFERRED] [semantically similar]
  README.md → Initial Requirements.txt

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Tripartite Logistics Marketplace Architecture** — initial_requirements_customer_app, initial_requirements_driver_partner_app, initial_requirements_operations_admin_portal, docs_swifload_architecture_components [EXTRACTED 1.00]
- **Dual-City Hub Setup and Financial Cost Comparison Pattern** — docs_setup_and_hardware_cost_bengaluru_guide, docs_setup_and_hardware_cost_coimbatore_guide, docs_setup_and_hardware_cost_bengaluru_variance_rationale [INFERRED 0.85]
- **Urban Fare Calculation and Dispatch Engine Flow** — readme_fare_engine [INFERRED 0.85]
- **Realtime Cloud State Synchronization & Telemetry Pipeline** — deployment_guide_realtime_sse, docs_swifload_telemetry_sse_dataflow, docs_swifload_trip_state_transitions [INFERRED 0.95]

## Communities (33 total, 9 thin omitted)

### Community 0 - "LogisticsContext.tsx"
Cohesion: 0.10
Nodes (68): ref_fs, ref_path, CustomerApp(), HeroBookingWidget(), HeroBookingWidgetProps, CreateTripPayload, INITIAL_CUSTOMER, LogisticsContext (+60 more)

### Community 1 - "WebPlatform.tsx"
Cohesion: 0.13
Nodes (13): CustomerReviewsSection(), EnterpriseSection(), FleetComparison(), FleetComparisonProps, ProhibitedGoodsModal(), ProhibitedGoodsModalProps, TrustAndSafetySection(), TrustAndSafetySectionProps (+5 more)

### Community 2 - "getDatabase"
Cohesion: 0.10
Nodes (35): Changes Required Specification, Driver Mobile Workflow UX Refinements, Customer Tariff Distance Slabs, Driver Negative Balance Limit Rules, Real-Time Telemetry SSE Dataflow Engine, Telemetry and Trip State Dataflow Diagram, ref_events, dynamic (+27 more)

### Community 3 - "dependencies"
Cohesion: 0.09
Nodes (23): @capacitor/android, @capacitor/cli, @capacitor/core, @capacitor/ios, clsx, lucide-react, dependencies, @capacitor/android (+15 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 5 - "🌐 SwifLoad — Azure Cloud Infrastructure Architecture Guide"
Cohesion: 0.07
Nodes (26): 1. Database Configuration Schema (`SystemConfig.maps`), 1. Database Configuration Schema (`SystemConfig.payments`), 1. Workload Profile & Concurrency Analysis (1,000 Users), 2. Google Pay (GPay) Deep Integration Architecture, 2. Provider Strengths for Coimbatore Launch:, 2. Target Azure Geographic Regions (Coimbatore Focus), 3. Architecture Option 1: Basic Infrastructure (Cost-Effective / MVP), 3. Dynamic Rendering in Admin & Apps: (+18 more)

### Community 6 - "generate_instagram_promo_v2.py"
Cohesion: 0.13
Nodes (20): cv2, imageio_ffmpeg, numpy, os, pil, playwright_sync_api, scipy_io_wavfile, create_video() (+12 more)

### Community 7 - "SwifLoad Cloud Deployment & Operations Manual"
Cohesion: 0.09
Nodes (21): Build Verification Rule, SwifLoad Agent Mandatory Rules, Mandatory Session Changelog Requirement, config, Project CLI and Build Commands, Claude Development Guide, Cloud Release Milestones and Task Order, Deployment Chronological Execution Log (+13 more)

### Community 9 - "DriverApp.tsx"
Cohesion: 0.14
Nodes (14): DriverPage(), FLOWERS, FlowerShowerSplash(), FlowerShowerSplashProps, Petal, DRIVER_13_DOCS, DRIVER_COMPANY_OFFERS, DRIVER_HELP_TOPICS (+6 more)

### Community 10 - "devDependencies"
Cohesion: 0.06
Nodes (30): autoprefixer, description, devDependencies, autoprefixer, postcss, tailwindcss, @types/leaflet, @types/node (+22 more)

### Community 11 - "SwifLoad Project Overview"
Cohesion: 0.18
Nodes (13): Customer Logistics App Scope, Initial Requirements Specification, Driver-Partner App Scope, Driver Transparency Rationale, Operations Admin Portal Scope, MVP Platform Essentials, Capacitor Mobile Deployment, Shipper Customer Mobile App (+5 more)

### Community 12 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, short_name, shortcuts (+2 more)

### Community 13 - "SwifLoad Architecture Diagram"
Cohesion: 0.22
Nodes (9): Architecture Runtime Boundary Criteria, Archify Architecture Generation Prompt, Architecture Spec Update 25-Sep-2026, Architecture Spec Update 26-Sep-2026, Archify System Architecture Visual Snapshot, Primary Shipper to Tracking Flow, SwifLoad 12 Core Architectural Components, SwifLoad Architecture Diagram (+1 more)

### Community 14 - "Bengaluru Setup and Hardware Cost Guide"
Cohesion: 0.29
Nodes (7): Bengaluru AIS-140 Dedicated Fleet Hardware, Bengaluru Setup and Hardware Cost Guide, Bengaluru Legal and Aggregator Licensing, Coimbatore vs Bengaluru CapEx and OpEx Variance Rationale, Coimbatore Setup and Hardware Cost Guide, Coimbatore Launch Hub and Infrastructure, Coimbatore Telemetry and Hardware Setup

### Community 15 - "layout.tsx"
Cohesion: 0.33
Nodes (4): src_app_globals, metadata, viewport, PwaRegister()

### Community 18 - "useLogistics"
Cohesion: 0.23
Nodes (9): AdminPage(), CustomerPage(), DownloadsPage(), Home(), AdminPortal(), CustomerSideMenu(), CustomerSideMenuProps, WebPlatform() (+1 more)

### Community 22 - "📘 SwifLoad — Azure Cloud Deployment & Testing Procedure Guide"
Cohesion: 0.06
Nodes (30): 1. Overview & Architecture, 2. Prerequisites & Environment Setup, 3.1 HTTP Header & Size Verification:, 3.2 Direct Download & Byte Verification:, 3. Step-by-Step Deployment Procedure, 4. Step-by-Step Testing & Acceptance Verification, 5. Troubleshooting & Operational Runbook, Phase 1: Local Codebase Build & Verification (+22 more)

### Community 23 - "LeafletMap.tsx"
Cohesion: 0.29
Nodes (6): LeafletMap, LeafletMap, LeafletMap(), LeafletMapProps, LiveTrackingModal(), LiveTrackingModalProps

## Knowledge Gaps
- **170 isolated node(s):** `config`, `nextConfig`, `name`, `version`, `description` (+165 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLogistics()` connect `useLogistics` to `LogisticsContext.tsx`, `WebPlatform.tsx`, `DriverApp.tsx`, `LeafletMap.tsx`, `BookingSuccessModal.tsx`, `DriverPartnerSection.tsx`, `PackersMoversSection.tsx`, `WebFooter.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `Next.js and Leaflet Project Conventions` connect `SwifLoad Cloud Deployment & Operations Manual` to `LogisticsContext.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `config`, `nextConfig`, `name` to the rest of the system?**
  _170 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `LogisticsContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09824561403508772 - nodes in this community are weakly interconnected._
- **Should `WebPlatform.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12857142857142856 - nodes in this community are weakly interconnected._
- **Should `getDatabase` be split into smaller, more focused modules?**
  _Cohesion score 0.09696969696969697 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._