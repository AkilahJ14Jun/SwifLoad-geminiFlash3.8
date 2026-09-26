# SwifLoad Agent Instructions & Mandatory Rules

## 🚨 MANDATORY END-OF-SESSION REQUIREMENT FOR ALL LLM MODELS
**CRITICAL:** Before exiting or concluding ANY user request / session in this codebase, regardless of which LLM model or tool is being used (Gemini, Claude, GPT, Cursor, Copilot, etc.), you **MUST ALWAYS** update `SESSION_CHANGELOG.md` with:

1. **Session Date:** e.g., `## 📅 Session: YYYY-MM-DD`
2. **Session Objectives:** High-level summary of what was requested.
3. **Bullet-Point Changes:**
   - Exact components, files, and functions modified or created.
   - Specific features implemented, bug fixes made, or architectural updates.
4. **Verification Status:** Build command run (e.g. `npm run build`), outcome, and lint/type check results.

> **Never skip this step.** Append new sessions to the top of `SESSION_CHANGELOG.md` under the main title.

---

## 🏗️ Project Architecture & Conventions
- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS.
- **State Management:** React Context (`src/context/LogisticsContext.tsx`) with localStorage caching.
- **Maps:** Leaflet via dynamic import in `src/components/Map/LeafletMap.tsx`.
- **Default Hub/City:** Coimbatore, Tamil Nadu (Coordinates: `11.0168, 76.9558`).
- **Build Verification:** Always run `npm run build` to confirm 0 TypeScript / compilation errors after editing.
