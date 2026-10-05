# Graph Report - SwifLoad-geminiFlash3.8  (2026-10-03)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 371 nodes · 721 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- useLogistics
- LogisticsContext.tsx
- getDatabase
- package.json
- WebPlatform.tsx
- 🌐 SwifLoad — Azure Cloud Infrastructure Architecture Guide
- generate_instagram_promo_v2.py
- SwifLoad Cloud Deployment & Operations Manual
- compilerOptions
- SwifLoad Project Overview
- dependencies
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
4. `WebPlatform()` - 16 edges
5. `compilerOptions` - 16 edges
6. `LogisticsContextType` - 15 edges
7. `broadcastEvent()` - 15 edges
8. `🌐 SwifLoad — Azure Cloud Infrastructure Architecture Guide` - 13 edges
9. `VehicleCategory` - 12 edges
10. `calculateCustomerQuotedSlabFare()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Customer Tariff Distance Slabs` --implements--> `calculateCustomerQuotedSlabFare()`  [INFERRED]
  Changes Required.txt → src/lib/pricing.ts
- `End-to-End Shipper to Delivery Cycle` --implements--> `CreateTripPayload`  [INFERRED]
  docs/swifload-booking-fulfillment-workflow.html → src/context/LogisticsContext.tsx
- `Deploying to Azure App Service Guide` --semantically_similar_to--> `Azure App Service and Container Registry Architecture`  [INFERRED] [semantically similar]
  docs/Deploying to Azure.txt → DEPLOYMENT_GUIDE.md
- `Architecture Runtime Boundary Criteria` --references--> `SwifLoad Architecture Diagram`  [INFERRED]
  archify_input.txt → docs/swifload-architecture.html
- `Archify System Architecture Visual Snapshot` --conceptually_related_to--> `SwifLoad Architecture Diagram`  [INFERRED]
  docs/Archify_Initial_Output_23Sep2026.JPG → docs/swifload-architecture.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Tripartite Logistics Marketplace Architecture** — initial_requirements_customer_app, initial_requirements_driver_partner_app, initial_requirements_operations_admin_portal, docs_swifload_architecture_components [EXTRACTED 1.00]
- **Dual-City Hub Setup and Financial Cost Comparison Pattern** — docs_setup_and_hardware_cost_bengaluru_guide, docs_setup_and_hardware_cost_coimbatore_guide, docs_setup_and_hardware_cost_bengaluru_variance_rationale [INFERRED 0.85]
- **Urban Fare Calculation and Dispatch Engine Flow** — readme_fare_engine [INFERRED 0.85]
- **Realtime Cloud State Synchronization & Telemetry Pipeline** — deployment_guide_realtime_sse, docs_swifload_telemetry_sse_dataflow, docs_swifload_trip_state_transitions [INFERRED 0.95]

## Communities (21 total, 5 thin omitted)

### Community 0 - "useLogistics"
Cohesion: 0.10
Nodes (37): End-to-End Shipper to Delivery Cycle, Booking and Fulfillment Workflow Diagram, Two-Way Pickup and Delivery OTP Verification, Trip Dispatch and OTP Handshake Sequence Diagram, AdminPage(), CustomerPage(), DriverPage(), Home() (+29 more)

### Community 1 - "LogisticsContext.tsx"
Cohesion: 0.15
Nodes (35): Trip State Machine Lifecycle Diagram, Discrete Trip State Machine Transitions, INITIAL_CUSTOMER, LogisticsContext, LogisticsContextType, BANGALORE_LANDMARKS, COIMBATORE_LANDMARKS, DEFAULT_CUSTOMER_SLABS (+27 more)

### Community 2 - "getDatabase"
Cohesion: 0.11
Nodes (30): Real-Time Telemetry SSE Dataflow Engine, Telemetry and Trip State Dataflow Diagram, dynamic, POST(), dynamic, GET(), PATCH(), dynamic (+22 more)

### Community 3 - "package.json"
Cohesion: 0.05
Nodes (39): description, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/postcss, @types/leaflet, @types/node (+31 more)

### Community 4 - "WebPlatform.tsx"
Cohesion: 0.07
Nodes (25): lucide-react, next, react, BookingSuccessModal(), BookingSuccessModalProps, CustomerReviewsSection(), DriverPartnerSection(), DriverPartnerSectionProps (+17 more)

### Community 5 - "🌐 SwifLoad — Azure Cloud Infrastructure Architecture Guide"
Cohesion: 0.07
Nodes (26): 1. Database Configuration Schema (`SystemConfig.maps`), 1. Database Configuration Schema (`SystemConfig.payments`), 1. Workload Profile & Concurrency Analysis (1,000 Users), 2. Google Pay (GPay) Deep Integration Architecture, 2. Provider Strengths for Coimbatore Launch:, 2. Target Azure Geographic Regions (Coimbatore Focus), 3. Architecture Option 1: Basic Infrastructure (Cost-Effective / MVP), 3. Dynamic Rendering in Admin & Apps: (+18 more)

### Community 6 - "generate_instagram_promo_v2.py"
Cohesion: 0.14
Nodes (11): create_video(), draw_rounded_rect(), get_font(), draw_rounded_rect(), generate_electronic_synth_beat(), get_font(), render_extended_promo_video(), draw_rounded_rect() (+3 more)

### Community 7 - "SwifLoad Cloud Deployment & Operations Manual"
Cohesion: 0.09
Nodes (21): Build Verification Rule, SwifLoad Agent Mandatory Rules, Mandatory Session Changelog Requirement, config, Project CLI and Build Commands, Claude Development Guide, Cloud Release Milestones and Task Order, Deployment Chronological Execution Log (+13 more)

### Community 8 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "SwifLoad Project Overview"
Cohesion: 0.18
Nodes (12): Customer Logistics App Scope, Initial Requirements Specification, Driver-Partner App Scope, Operations Admin Portal Scope, MVP Platform Essentials, Capacitor Mobile Deployment, Shipper Customer Mobile App, Driver-Partner Mobile App (+4 more)

### Community 10 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, @capacitor/android, @capacitor/cli, @capacitor/core, @capacitor/ios, clsx, leaflet, lucide-react (+4 more)

### Community 11 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, short_name, shortcuts (+2 more)

### Community 12 - "SwifLoad Architecture Diagram"
Cohesion: 0.22
Nodes (9): Architecture Runtime Boundary Criteria, Archify Architecture Generation Prompt, Architecture Spec Update 25-Sep-2026, Architecture Spec Update 26-Sep-2026, Archify System Architecture Visual Snapshot, Primary Shipper to Tracking Flow, SwifLoad 12 Core Architectural Components, SwifLoad Architecture Diagram (+1 more)

### Community 13 - "Bengaluru Setup and Hardware Cost Guide"
Cohesion: 0.29
Nodes (6): Bengaluru AIS-140 Dedicated Fleet Hardware, Bengaluru Setup and Hardware Cost Guide, Bengaluru Legal and Aggregator Licensing, Coimbatore Setup and Hardware Cost Guide, Coimbatore Launch Hub and Infrastructure, Coimbatore Telemetry and Hardware Setup

### Community 14 - "layout.tsx"
Cohesion: 0.33
Nodes (3): metadata, viewport, PwaRegister()

### Community 15 - "Changes Required Specification"
Cohesion: 0.50
Nodes (4): Changes Required Specification, Driver Mobile Workflow UX Refinements, Customer Tariff Distance Slabs, Driver Negative Balance Limit Rules

## Knowledge Gaps
- **151 isolated node(s):** `LeafletMapProps`, `LiveTrackingModalProps`, `HeroBookingWidgetProps`, `DriverKycDoc`, `EventType` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 167 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `WebPlatform.tsx` to `useLogistics`, `LogisticsContext.tsx`, `package.json`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `next` connect `WebPlatform.tsx` to `useLogistics`, `LogisticsContext.tsx`, `getDatabase`, `package.json`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **What connects `LeafletMapProps`, `LiveTrackingModalProps`, `HeroBookingWidgetProps` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useLogistics` be split into smaller, more focused modules?**
  _Cohesion score 0.09990749306197964 - nodes in this community are weakly interconnected._
- **Should `LogisticsContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14634146341463414 - nodes in this community are weakly interconnected._
- **Should `getDatabase` be split into smaller, more focused modules?**
  _Cohesion score 0.11219512195121951 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._