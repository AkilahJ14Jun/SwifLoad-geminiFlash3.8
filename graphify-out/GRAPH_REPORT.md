# Graph Report - SwifLoad-geminiFlash3.8-master  (2026-10-01)

## Corpus Check
- 76 files · ~353,845 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 4, .zip 4, .apk 2)

## Summary
- 320 nodes · 726 edges · 17 communities (12 shown, 5 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Core UI Components & Admin Portal
- Booking Fulfillment & Server Database Engine
- Mobile Architecture & Capacitor Integration
- Real-Time Telemetry & Backend REST Routes
- Tariff Slabs & OTP Verification Flow
- Agent Instructions & Deployment Operations
- TypeScript Configuration & Compiler Options
- Core Product Requirements & Portal Scopes
- PWA Web App Manifest & Branding
- Archify Architecture Specifications & Diagram Models
- Build Tooling & UI Dependencies
- Hub Infrastructure & Hardware Cost Analysis
- Next.js Framework & Runtime Config
- Software Outsourcing & Cost Estimates

## God Nodes (most connected - your core abstractions)
1. `useLogistics()` - 31 edges
2. `react` - 26 edges
3. `getDatabase()` - 24 edges
4. `lucide-react` - 23 edges
5. `next` - 19 edges
6. `saveDatabase()` - 18 edges
7. `WebPlatform()` - 17 edges
8. `LogisticsContextType` - 15 edges
9. `broadcastEvent()` - 15 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)
- `End-to-End Shipper to Delivery Cycle` --implements--> `CreateTripPayload`  [INFERRED]
  docs/swifload-booking-fulfillment-workflow.html → src/context/LogisticsContext.tsx
- `Customer Tariff Distance Slabs` --implements--> `calculateCustomerQuotedSlabFare()`  [INFERRED]
  Changes Required.txt → src/lib/pricing.ts
- `Deploying to Azure App Service Guide` --semantically_similar_to--> `Azure App Service and Container Registry Architecture`  [INFERRED] [semantically similar]
  docs/Deploying to Azure.txt → DEPLOYMENT_GUIDE.md
- `Initial Cloud Release Task Checklist` --conceptually_related_to--> `SwifLoad Cloud Deployment & Operations Manual`  [INFERRED]
  docs/App Initial cloud release tasks.txt → DEPLOYMENT_GUIDE.md
- `Architecture Runtime Boundary Criteria` --references--> `SwifLoad Architecture Diagram`  [INFERRED]
  archify_input.txt → docs/swifload-architecture.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Urban Fare Calculation and Dispatch Engine Flow** — readme_fare_engine [INFERRED 0.85]
- **Tripartite Logistics Marketplace Architecture** — initial_requirements_customer_app, initial_requirements_driver_partner_app, initial_requirements_operations_admin_portal, docs_swifload_architecture_components [EXTRACTED 1.00]
- **Dual-City Hub Setup and Financial Cost Comparison Pattern** — docs_setup_and_hardware_cost_bengaluru_guide, docs_setup_and_hardware_cost_coimbatore_guide, docs_setup_and_hardware_cost_bengaluru_variance_rationale [INFERRED 0.85]
- **Realtime Cloud State Synchronization & Telemetry Pipeline** — deployment_guide_realtime_sse, docs_swifload_telemetry_sse_dataflow, docs_swifload_trip_state_transitions [INFERRED 0.95]

## Communities (17 total, 5 thin omitted)

### Community 0 - "Core UI Components & Admin Portal"
Cohesion: 0.09
Nodes (39): leaflet, lucide-react, react, AdminPage(), DriverPage(), Home(), AdminPortal(), LeafletMap (+31 more)

### Community 1 - "Booking Fulfillment & Server Database Engine"
Cohesion: 0.12
Nodes (45): End-to-End Shipper to Delivery Cycle, Booking and Fulfillment Workflow Diagram, Trip State Machine Lifecycle Diagram, Discrete Trip State Machine Transitions, CreateTripPayload, INITIAL_CUSTOMER, LogisticsContext, LogisticsContextType (+37 more)

### Community 2 - "Mobile Architecture & Capacitor Integration"
Cohesion: 0.05
Nodes (42): config, Next.js and Leaflet Project Conventions, Copilot Architecture Guidelines, dependencies, @capacitor/android, @capacitor/cli, @capacitor/core, @capacitor/ios (+34 more)

### Community 3 - "Real-Time Telemetry & Backend REST Routes"
Cohesion: 0.12
Nodes (32): Real-Time Telemetry SSE Dataflow Engine, Telemetry and Trip State Dataflow Diagram, next, dynamic, POST(), dynamic, GET(), PATCH() (+24 more)

### Community 4 - "Tariff Slabs & OTP Verification Flow"
Cohesion: 0.13
Nodes (21): Changes Required Specification, Driver Mobile Workflow UX Refinements, Customer Tariff Distance Slabs, Driver Negative Balance Limit Rules, Two-Way Pickup and Delivery OTP Verification, Trip Dispatch and OTP Handshake Sequence Diagram, CustomerPage(), metadata (+13 more)

### Community 5 - "Agent Instructions & Deployment Operations"
Cohesion: 0.11
Nodes (18): Build Verification Rule, SwifLoad Agent Mandatory Rules, Mandatory Session Changelog Requirement, Project CLI and Build Commands, Claude Development Guide, Cloud Release Milestones and Task Order, Deployment Chronological Execution Log, Azure App Service and Container Registry Architecture (+10 more)

### Community 6 - "TypeScript Configuration & Compiler Options"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+9 more)

### Community 7 - "Core Product Requirements & Portal Scopes"
Cohesion: 0.18
Nodes (12): Customer Logistics App Scope, Initial Requirements Specification, Driver-Partner App Scope, Operations Admin Portal Scope, MVP Platform Essentials, Capacitor Mobile Deployment, Shipper Customer Mobile App, Driver-Partner Mobile App (+4 more)

### Community 8 - "PWA Web App Manifest & Branding"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, short_name, shortcuts (+2 more)

### Community 9 - "Archify Architecture Specifications & Diagram Models"
Cohesion: 0.22
Nodes (9): Architecture Runtime Boundary Criteria, Archify Architecture Generation Prompt, Architecture Spec Update 25-Sep-2026, Architecture Spec Update 26-Sep-2026, Archify System Architecture Visual Snapshot, Primary Shipper to Tracking Flow, SwifLoad 12 Core Architectural Components, SwifLoad Architecture Diagram (+1 more)

### Community 10 - "Build Tooling & UI Dependencies"
Cohesion: 0.22
Nodes (9): devDependencies, autoprefixer, postcss, tailwindcss, @types/leaflet, @types/node, @types/react, @types/react-dom (+1 more)

### Community 11 - "Hub Infrastructure & Hardware Cost Analysis"
Cohesion: 0.29
Nodes (6): Bengaluru AIS-140 Dedicated Fleet Hardware, Bengaluru Setup and Hardware Cost Guide, Bengaluru Legal and Aggregator Licensing, Coimbatore Setup and Hardware Cost Guide, Coimbatore Launch Hub and Infrastructure, Coimbatore Telemetry and Hardware Setup

## Knowledge Gaps
- **128 isolated node(s):** `config`, `nextConfig`, `name`, `version`, `description` (+123 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 141 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Real-Time Telemetry & Backend REST Routes` to `Core UI Components & Admin Portal`, `Booking Fulfillment & Server Database Engine`, `Mobile Architecture & Capacitor Integration`, `Tariff Slabs & OTP Verification Flow`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **Why does `react` connect `Core UI Components & Admin Portal` to `Booking Fulfillment & Server Database Engine`, `Mobile Architecture & Capacitor Integration`, `Tariff Slabs & OTP Verification Flow`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **What connects `config`, `nextConfig`, `name` to the rest of the system?**
  _128 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core UI Components & Admin Portal` be split into smaller, more focused modules?**
  _Cohesion score 0.08813559322033898 - nodes in this community are weakly interconnected._
- **Should `Booking Fulfillment & Server Database Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.11973875181422351 - nodes in this community are weakly interconnected._
- **Should `Mobile Architecture & Capacitor Integration` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `Real-Time Telemetry & Backend REST Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.1173054587688734 - nodes in this community are weakly interconnected._