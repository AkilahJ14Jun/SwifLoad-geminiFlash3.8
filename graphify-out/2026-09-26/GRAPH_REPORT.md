# Graph Report - SwifLoad-geminiFlash3.8  (2026-09-25)

## Corpus Check
- 41 files · ~95,603 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 259 nodes · 423 edges · 19 communities (16 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Core App Views and Map Integration
- Customer Booking and Portals
- Product Requirements and Scope
- TypeScript and Next.js Types
- Capacitor Mobile Dependencies
- Styling Tooling and PostCSS
- High-Level Architecture Model
- Bengaluru Setup and Hardware Costs
- Project Manifest and Scripts
- Web App Manifest and PWA Config
- Runtime Architecture Specs
- Root Layout and Metadata
- Capacitor Native Config
- Next.js Build Configuration

## God Nodes (most connected - your core abstractions)
1. `useLogistics()` - 25 edges
2. `compilerOptions` - 15 edges
3. `VehicleCategory` - 12 edges
4. `SwifLoad Architecture Diagram` - 12 edges
5. `LogisticsContextType` - 10 edges
6. `scripts` - 8 edges
7. `calculateDistanceKm()` - 8 edges
8. `calculateFare()` - 8 edges
9. `LocationPoint` - 8 edges
10. `SwifLoad Project Overview` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Changes Required Document` --conceptually_related_to--> `SwifLoad Project Overview`  [AMBIGUOUS]
  Changes Required.txt → README.md
- `Shipper Customer Mobile App` --semantically_similar_to--> `Customer Logistics App Scope`  [INFERRED] [semantically similar]
  README.md → Initial Requirements.txt
- `Driver-Partner Mobile App` --semantically_similar_to--> `Driver-Partner App Scope`  [INFERRED] [semantically similar]
  README.md → Initial Requirements.txt
- `Operations Command Center Portal` --semantically_similar_to--> `Operations Admin Portal Scope`  [INFERRED] [semantically similar]
  README.md → Initial Requirements.txt
- `Web Platform Marketing and Booking Component` --semantically_similar_to--> `SwifLoad Web Platform`  [INFERRED] [semantically similar]
  swifload-architecture.html → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Tripartite Logistics Marketplace Architecture** — swifload_architecture_customer_app_component, swifload_architecture_driver_app_component, swifload_architecture_admin_portal_component, swifload_architecture_logistics_context_component [EXTRACTED 1.00]
- **Urban Fare Calculation and Dispatch Engine Flow** — swifload_architecture_pricing_engine_component, swifload_architecture_logistics_context_component, swifload_architecture_customer_app_component, readme_fare_engine [INFERRED 0.85]
- **Dual-City Hub Setup and Financial Cost Comparison Pattern** — setup_and_hardware_cost_bengaluru_setup_guide, setup_and_hardware_cost_coimbatore_setup_guide, setup_and_hardware_cost_coimbatore_bengaluru_comparison [INFERRED 0.85]

## Communities (19 total, 3 thin omitted)

### Community 0 - "Core App Views and Map Integration"
Cohesion: 0.07
Nodes (33): Home(), AdminPortal(), LeafletMap, LeafletMap, DriverApp(), LeafletMap, LeafletMap(), LeafletMapProps (+25 more)

### Community 1 - "Customer Booking and Portals"
Cohesion: 0.15
Nodes (34): CustomerApp(), HeroBookingWidget(), HeroBookingWidgetProps, CreateTripPayload, INITIAL_CUSTOMER, LogisticsContext, LogisticsContextType, LogisticsProvider() (+26 more)

### Community 2 - "Product Requirements and Scope"
Cohesion: 0.07
Nodes (34): Changes Required Document, Customer Logistics App Scope, Initial Requirements Specification, Driver-Partner App Scope, Driver Transparency Rationale, Operations Admin Portal Scope, MVP Platform Essentials, Starter MVP Scope (+26 more)

### Community 3 - "TypeScript and Next.js Types"
Cohesion: 0.08
Nodes (25): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+17 more)

### Community 4 - "Capacitor Mobile Dependencies"
Cohesion: 0.09
Nodes (23): @capacitor/android, @capacitor/cli, @capacitor/core, @capacitor/ios, clsx, lucide-react, dependencies, @capacitor/android (+15 more)

### Community 5 - "Styling Tooling and PostCSS"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/leaflet, @types/node, @types/react (+9 more)

### Community 6 - "High-Level Architecture Model"
Cohesion: 0.28
Nodes (15): SwifLoad Architecture Diagram, Admin Portal, Admin Privilege Boundary, Capacitor Shell, CartoDB Voyager, Client-Side Runtime Boundary, Customer App, Driver App (+7 more)

### Community 7 - "Bengaluru Setup and Hardware Costs"
Cohesion: 0.14
Nodes (14): Bengaluru Production Cloud and Telecom Integration, Bengaluru AIS-140 Dedicated Fleet Hardware, Bengaluru Command Center Hardware and QA Lab, Bengaluru Legal and Aggregator Licensing, Bengaluru Physical Onboarding and Ops Hub, Bengaluru Setup and Hardware Cost Guide, Bengaluru Launch Capital Budget, Coimbatore vs Bengaluru CapEx and OpEx Variance Rationale (+6 more)

### Community 8 - "Project Manifest and Scripts"
Cohesion: 0.15
Nodes (12): description, name, private, scripts, build, cap:android, cap:ios, cap:sync (+4 more)

### Community 9 - "Web App Manifest and PWA Config"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 10 - "Runtime Architecture Specs"
Cohesion: 0.40
Nodes (5): Architecture Runtime Boundary Criteria, Archify Architecture Generation Prompt, Admin Privilege Boundary, Client-Side Runtime Boundary, SwifLoad Runtime Architecture Visualization

## Ambiguous Edges - Review These
- `Changes Required Document` → `SwifLoad Project Overview`  [AMBIGUOUS]
  Changes Required.txt · relation: conceptually_related_to

## Knowledge Gaps
- **98 isolated node(s):** `config`, `nextConfig`, `name`, `version`, `description` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Changes Required Document` and `SwifLoad Project Overview`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `Capacitor Mobile Dependencies` to `Project Manifest and Scripts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Styling Tooling and PostCSS` to `Project Manifest and Scripts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `useLogistics()` connect `Core App Views and Map Integration` to `Customer Booking and Portals`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `config`, `nextConfig`, `name` to the rest of the system?**
  _98 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core App Views and Map Integration` be split into smaller, more focused modules?**
  _Cohesion score 0.070578231292517 - nodes in this community are weakly interconnected._
- **Should `Product Requirements and Scope` be split into smaller, more focused modules?**
  _Cohesion score 0.07308377896613191 - nodes in this community are weakly interconnected._