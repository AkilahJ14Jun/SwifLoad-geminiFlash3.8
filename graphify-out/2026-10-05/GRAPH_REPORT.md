# Graph Report - SwifLoad-geminiFlash3.8  (2026-10-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 384 nodes · 733 edges · 22 communities (20 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3a1a432d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useLogistics
- LogisticsContext.tsx
- getDatabase
- pricing.ts
- devDependencies
- compilerOptions
- 🌐 SwifLoad — Azure Cloud Infrastructure Architecture Guide
- generate_instagram_promo_v2.py
- dependencies
- SwifLoad Cloud Deployment & Operations Manual
- SwifLoad Project Overview
- manifest.json
- SwifLoad Architecture Diagram
- Bengaluru Setup and Hardware Cost Guide
- layout.tsx
- Changes Required Specification
- Software Outsourcing Cost Estimate
- next.config.mjs

## God Nodes (most connected - your core abstractions)
1. `useLogistics()` - 31 edges
2. `getDatabase()` - 23 edges
3. `saveDatabase()` - 18 edges
4. `LogisticsContextType` - 16 edges
5. `WebPlatform()` - 16 edges
6. `compilerOptions` - 16 edges
7. `broadcastEvent()` - 15 edges
8. `🌐 SwifLoad — Azure Cloud Infrastructure Architecture Guide` - 13 edges
9. `VehicleCategory` - 12 edges
10. `DatabaseSchema` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Customer Tariff Distance Slabs` --implements--> `calculateCustomerQuotedSlabFare()`  [INFERRED]
  Changes Required.txt → src/lib/pricing.ts
- `End-to-End Shipper to Delivery Cycle` --implements--> `CreateTripPayload`  [INFERRED]
  docs/swifload-booking-fulfillment-workflow.html → src/context/LogisticsContext.tsx
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

## Communities (22 total, 2 thin omitted)

### Community 0 - "useLogistics"
Cohesion: 0.07
Nodes (37): AdminPage(), CustomerPage(), DriverPage(), Home(), AdminPortal(), LeafletMap, LeafletMap, DRIVER_SPONSORED_ADS (+29 more)

### Community 1 - "LogisticsContext.tsx"
Cohesion: 0.14
Nodes (39): Trip State Machine Lifecycle Diagram, Discrete Trip State Machine Transitions, ref_fs, ref_path, INITIAL_CUSTOMER, LogisticsContext, LogisticsContextType, BANGALORE_LANDMARKS (+31 more)

### Community 2 - "getDatabase"
Cohesion: 0.11
Nodes (31): Real-Time Telemetry SSE Dataflow Engine, Telemetry and Trip State Dataflow Diagram, ref_events, dynamic, POST(), dynamic, GET(), PATCH() (+23 more)

### Community 3 - "pricing.ts"
Cohesion: 0.15
Nodes (27): End-to-End Shipper to Delivery Cycle, Booking and Fulfillment Workflow Diagram, Two-Way Pickup and Delivery OTP Verification, Trip Dispatch and OTP Handshake Sequence Diagram, CustomerApp(), FleetComparison(), FleetComparisonProps, HeroBookingWidget() (+19 more)

### Community 4 - "devDependencies"
Cohesion: 0.07
Nodes (29): autoprefixer, description, devDependencies, autoprefixer, postcss, tailwindcss, @types/leaflet, @types/node (+21 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 6 - "🌐 SwifLoad — Azure Cloud Infrastructure Architecture Guide"
Cohesion: 0.08
Nodes (25): 1. Database Configuration Schema (`SystemConfig.maps`), 1. Database Configuration Schema (`SystemConfig.payments`), 1. Workload Profile & Concurrency Analysis (1,000 Users), 2. Google Pay (GPay) Deep Integration Architecture, 2. Provider Strengths for Coimbatore Launch:, 2. Target Azure Geographic Regions (Coimbatore Focus), 3. Architecture Option 1: Basic Infrastructure (Cost-Effective / MVP), 3. Dynamic Rendering in Admin & Apps: (+17 more)

### Community 7 - "generate_instagram_promo_v2.py"
Cohesion: 0.14
Nodes (20): cv2, imageio_ffmpeg, numpy, os, pil, playwright_sync_api, scipy_io_wavfile, create_video() (+12 more)

### Community 8 - "dependencies"
Cohesion: 0.09
Nodes (23): @capacitor/android, @capacitor/cli, @capacitor/core, @capacitor/ios, clsx, leaflet, lucide-react, next (+15 more)

### Community 9 - "SwifLoad Cloud Deployment & Operations Manual"
Cohesion: 0.09
Nodes (21): Build Verification Rule, SwifLoad Agent Mandatory Rules, Mandatory Session Changelog Requirement, config, Project CLI and Build Commands, Claude Development Guide, Cloud Release Milestones and Task Order, Deployment Chronological Execution Log (+13 more)

### Community 10 - "SwifLoad Project Overview"
Cohesion: 0.18
Nodes (13): Customer Logistics App Scope, Initial Requirements Specification, Driver-Partner App Scope, Driver Transparency Rationale, Operations Admin Portal Scope, MVP Platform Essentials, Capacitor Mobile Deployment, Shipper Customer Mobile App (+5 more)

### Community 11 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, short_name, shortcuts (+2 more)

### Community 12 - "SwifLoad Architecture Diagram"
Cohesion: 0.22
Nodes (9): Architecture Runtime Boundary Criteria, Archify Architecture Generation Prompt, Architecture Spec Update 25-Sep-2026, Architecture Spec Update 26-Sep-2026, Archify System Architecture Visual Snapshot, Primary Shipper to Tracking Flow, SwifLoad 12 Core Architectural Components, SwifLoad Architecture Diagram (+1 more)

### Community 13 - "Bengaluru Setup and Hardware Cost Guide"
Cohesion: 0.29
Nodes (7): Bengaluru AIS-140 Dedicated Fleet Hardware, Bengaluru Setup and Hardware Cost Guide, Bengaluru Legal and Aggregator Licensing, Coimbatore vs Bengaluru CapEx and OpEx Variance Rationale, Coimbatore Setup and Hardware Cost Guide, Coimbatore Launch Hub and Infrastructure, Coimbatore Telemetry and Hardware Setup

### Community 14 - "layout.tsx"
Cohesion: 0.33
Nodes (4): src_app_globals, metadata, viewport, PwaRegister()

### Community 15 - "Changes Required Specification"
Cohesion: 0.50
Nodes (4): Changes Required Specification, Driver Mobile Workflow UX Refinements, Customer Tariff Distance Slabs, Driver Negative Balance Limit Rules

## Knowledge Gaps
- **138 isolated node(s):** `BookingSuccessModalProps`, `DriverPartnerSectionProps`, `PackersMoversSectionProps`, `ProhibitedGoodsModalProps`, `TrustAndSafetySectionProps` (+133 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Next.js and Leaflet Project Conventions` connect `SwifLoad Cloud Deployment & Operations Manual` to `LogisticsContext.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `useLogistics()` connect `useLogistics` to `LogisticsContext.tsx`, `pricing.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `BookingSuccessModalProps`, `DriverPartnerSectionProps`, `PackersMoversSectionProps` to the rest of the system?**
  _138 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useLogistics` be split into smaller, more focused modules?**
  _Cohesion score 0.06531986531986532 - nodes in this community are weakly interconnected._
- **Should `LogisticsContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1427061310782241 - nodes in this community are weakly interconnected._
- **Should `getDatabase` be split into smaller, more focused modules?**
  _Cohesion score 0.11219512195121951 - nodes in this community are weakly interconnected._
- **Should `pricing.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14623655913978495 - nodes in this community are weakly interconnected._