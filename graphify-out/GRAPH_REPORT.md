# Graph Report - SwifLoad-geminiFlash3.8  (2026-09-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 222 nodes · 412 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7515f5ae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- LogisticsContext.tsx
- WebPlatform.tsx
- compilerOptions
- dependencies
- useLogistics
- devDependencies
- SwifLoad Project Overview
- scripts
- LeafletMap.tsx
- manifest.json
- layout.tsx
- Architecture Runtime Boundary Criteria
- capacitor.config.ts
- next.config.mjs

## God Nodes (most connected - your core abstractions)
1. `useLogistics()` - 25 edges
2. `LogisticsContextType` - 15 edges
3. `compilerOptions` - 15 edges
4. `VehicleCategory` - 12 edges
5. `calculateCustomerQuotedSlabFare()` - 10 edges
6. `calculateDistanceKm()` - 10 edges
7. `LocationPoint` - 8 edges
8. `scripts` - 8 edges
9. `CustomerType` - 7 edges
10. `LogisticsProvider()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Shipper Customer Mobile App` --semantically_similar_to--> `Customer Logistics App Scope`  [INFERRED] [semantically similar]
  README.md → Initial Requirements.txt
- `Driver-Partner Mobile App` --semantically_similar_to--> `Driver-Partner App Scope`  [INFERRED] [semantically similar]
  README.md → Initial Requirements.txt
- `Operations Command Center Portal` --semantically_similar_to--> `Operations Admin Portal Scope`  [INFERRED] [semantically similar]
  README.md → Initial Requirements.txt
- `Changes Required Document` --conceptually_related_to--> `SwifLoad Project Overview`  [AMBIGUOUS]
  Changes Required.txt → README.md
- `LiveTrackingModal()` --calls--> `useLogistics()`  [EXTRACTED]
  src/components/Website/LiveTrackingModal.tsx → src/context/LogisticsContext.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Urban Fare Calculation and Dispatch Engine Flow** — readme_fare_engine [INFERRED 0.85]

## Communities (16 total, 4 thin omitted)

### Community 0 - "LogisticsContext.tsx"
Cohesion: 0.13
Nodes (38): AdminPortal(), INITIAL_CUSTOMER, LogisticsContext, LogisticsContextType, BANGALORE_LANDMARKS, COIMBATORE_LANDMARKS, DEFAULT_CUSTOMER_SLABS, DEFAULT_REFERRAL_CONFIG (+30 more)

### Community 1 - "WebPlatform.tsx"
Cohesion: 0.08
Nodes (18): CustomerReviewsSection(), DriverPartnerSection(), DriverPartnerSectionProps, EnterpriseSection(), FleetComparison(), FleetComparisonProps, PackersMoversSection(), PackersMoversSectionProps (+10 more)

### Community 2 - "compilerOptions"
Cohesion: 0.08
Nodes (25): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+17 more)

### Community 3 - "dependencies"
Cohesion: 0.09
Nodes (23): @capacitor/android, @capacitor/cli, @capacitor/core, @capacitor/ios, clsx, lucide-react, dependencies, @capacitor/android (+15 more)

### Community 4 - "useLogistics"
Cohesion: 0.22
Nodes (16): Home(), CustomerApp(), DriverApp(), BookingSuccessModal(), BookingSuccessModalProps, HeroBookingWidget(), HeroBookingWidgetProps, WebPlatform() (+8 more)

### Community 5 - "devDependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/leaflet, @types/node, @types/react (+9 more)

### Community 6 - "SwifLoad Project Overview"
Cohesion: 0.15
Nodes (15): Changes Required Document, Customer Logistics App Scope, Initial Requirements Specification, Driver-Partner App Scope, Driver Transparency Rationale, Operations Admin Portal Scope, MVP Platform Essentials, Starter MVP Scope (+7 more)

### Community 7 - "scripts"
Cohesion: 0.15
Nodes (12): description, name, private, scripts, build, cap:android, cap:ios, cap:sync (+4 more)

### Community 8 - "LeafletMap.tsx"
Cohesion: 0.20
Nodes (8): LeafletMap, LeafletMap, LeafletMap, LeafletMap(), LeafletMapProps, LiveTrackingModal(), LiveTrackingModalProps, TripStatus

### Community 9 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

## Ambiguous Edges - Review These
- `Changes Required Document` → `SwifLoad Project Overview`  [AMBIGUOUS]
  Changes Required.txt · relation: conceptually_related_to

## Knowledge Gaps
- **87 isolated node(s):** `DriverKycDoc`, `ProhibitedGoodsModalProps`, `TrustAndSafetySectionProps`, `WebFaqSectionProps`, `DriverPartnerSectionProps` (+82 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Changes Required Document` and `SwifLoad Project Overview`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `useLogistics()` connect `useLogistics` to `LogisticsContext.tsx`, `WebPlatform.tsx`, `LeafletMap.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `DriverKycDoc`, `ProhibitedGoodsModalProps`, `TrustAndSafetySectionProps` to the rest of the system?**
  _87 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `LogisticsContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13399778516057587 - nodes in this community are weakly interconnected._
- **Should `WebPlatform.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08266129032258064 - nodes in this community are weakly interconnected._