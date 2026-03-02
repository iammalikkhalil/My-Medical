# Medi-Track Full Build Plan (Phase-Wise, Fully Split, Weighted Progress Tracking)

## Summary
Build the full Personal Medical Kit Web App from the current starter repo to production-ready state, exactly aligned to your documentation, using a **full-spec-first** rollout with **weighted gate tracking** and **scripted seed data**.

## Current Standing (As of March 3, 2026)
| Area | Target | Current | Status |
|---|---:|---:|---|
| App pages | 16 documented pages | 1 `page.tsx` starter page | Not started |
| API contracts | 42 documented endpoints | 0 route handlers | Not started |
| DB models/collections | 11 required (including `usage_logs`) | 0 | Not started |
| Auth/session | Full static-cookie auth + middleware | None | Not started |
| UI system | Full responsive “sick-day-first” design system | Starter styles only | Not started |
| Deployment readiness | Vercel + env + indexes + smoke checks | Partial template only | Not started |

**Implementation progress baseline:** `0%`  
**Planning progress:** `100%` (requirements extracted and execution plan locked)

## Locked Decisions
1. Delivery mode: **Full Spec First**.
2. Progress mode: **Weighted Gates**.
3. Stack baseline: **Keep current repo stack** (Next.js 16 + React 19 + TypeScript).
4. Seed strategy: **Scripted, deterministic, idempotent seed data**.
5. Skill usage: **No skill applied** (`skill-creator`/`skill-installer` are not relevant to this task).

## Public APIs / Interfaces / Types To Add
| Category | Additions |
|---|---|
| API routes | All documented `/api/**` endpoints, implemented as `route.ts` handlers in App Router. |
| Session/auth interface | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/check`, signed HTTP-only cookie, middleware protection for pages and APIs. |
| Data models | `Category`, `Symptom`, `Medicine`, `MedicineSymptom`, `IllnessEpisode`, `EpisodeSymptom`, `EpisodeMedicine`, `EpisodeDose`, `Blog`, `BlogSymptom`, `UsageLog`. |
| Request/response contracts | Shared TS DTOs for each endpoint (`CreateMedicineInput`, `StartEpisodeInput`, `LogDoseInput`, etc.). |
| Shared API envelope | Unified response shape: `{ success, data, error }` with standardized status codes. |
| Query/aggregation services | Domain services for dashboard, illness detail, insights, and lookup-heavy joins. |
| UI interfaces | Typed view-models for Dashboard cards, episode timelines, inventory list rows, blog sections, insights cards. |

## Progress Tracking System (Weighted Gates)
## Formula
`Overall % = Σ(Phase Weight % × Phase Completion %)`  

## Completion Rule
A work package is complete only when:
1. Code is implemented.
2. Related tests pass.
3. Exit-gate evidence is logged in tracker.

## Status Values
`Not Started`, `In Progress`, `Blocked`, `In Review`, `Done`

## Tracker Fields (single source of truth)
`WP ID`, `Phase`, `Task`, `Owner`, `Weight`, `Status`, `Start Date`, `Target Date`, `Actual Date`, `Blocker`, `Evidence`

## Phase Weights (sum = 100%)
| Phase | Weight |
|---|---:|
| P0 Program Setup & Tracking | 4 |
| P1 Foundation & Architecture Skeleton | 7 |
| P2 Database Layer & Seed System | 11 |
| P3 Authentication & Route Protection | 8 |
| P4 Shared UI System & Navigation Shell | 9 |
| P5 Categories + Symptoms Modules | 9 |
| P6 Medicines Modules | 13 |
| P7 Illness Episode Modules | 14 |
| P8 Blogs Modules | 8 |
| P9 Dashboard + Insights Modules | 7 |
| P10 QA, Security, Performance Hardening | 7 |
| P11 Deployment, Ops, Handover | 3 |

---

## P0 Program Setup & Tracking (Weight 4%)
**Goal:** Establish execution controls before build work.

| WP ID | Task | Output | Weight |
|---|---|---|---:|
| P0.1 | Convert documentation into build backlog IDs | Traceability matrix (`section -> WP`) | 1 |
| P0.2 | Create weighted tracker sheet structure | Progress board template | 1 |
| P0.3 | Define strict DoD per module | Written DoD checklist | 1 |
| P0.4 | Create risk and blocker log format | Risk register template | 1 |

**Exit Gate:** Tracker, DoD, and traceability matrix are ready and agreed.

## P1 Foundation & Architecture Skeleton (Weight 7%)
**Goal:** Create project structure matching target architecture.

| WP ID | Task | Output | Weight |
|---|---|---|---:|
| P1.1 | Install core dependencies (`mongoose`, `zod`, cookie/signature helper, date utils) | Updated dependency graph | 1 |
| P1.2 | Create env validation module | Typed env loader with required vars | 1 |
| P1.3 | Build folder skeleton for route groups and APIs | Documented target directory structure | 1 |
| P1.4 | Add shared helpers (`slug`, `time`, `response`, `errors`) | Reusable utility layer | 1 |
| P1.5 | Set app metadata and naming (“MedKit”) | Correct title/description/icons | 1 |
| P1.6 | Configure lint/typecheck/test scripts and CI command sequence | Quality gate scripts | 1 |
| P1.7 | Add error boundary and not-found baseline pages | Global error handling baseline | 1 |

**Exit Gate:** App structure exists, scripts run cleanly, no business features yet.

## P2 Database Layer & Seed System (Weight 11%)
**Goal:** Implement all collections, indexes, and seeders.

| WP ID | Task | Output | Weight |
|---|---|---|---:|
| P2.1 | Mongo connection singleton with caching | Stable DB connector | 1 |
| P2.2 | Implement all 11 Mongoose schemas | Typed model files | 3 |
| P2.3 | Add indexes exactly per spec | Indexed collections | 2 |
| P2.4 | Add partial uniqueness for single ongoing episode | DB-level safety guard | 1 |
| P2.5 | Add `usage_logs` schema (missing in sectioned schema but required by APIs/rules) | Consistent logging model | 1 |
| P2.6 | Build idempotent seed script (categories/symptoms/starter blogs) | Repeatable seed command | 2 |
| P2.7 | Add model-level validation rules and defaults | Reliable data integrity | 1 |

**Exit Gate:** Fresh DB can be seeded and queried with all models loaded and indexed.

## P3 Authentication & Route Protection (Weight 8%)
**Goal:** Implement static auth with secure signed sessions.

| WP ID | Task | Output | Weight |
|---|---|---|---:|
| P3.1 | Build session signer/verifier using `SESSION_SECRET` | `medkit_session` cookie mechanism | 2 |
| P3.2 | Implement `/api/auth/login` with remember-me max-age logic | 30-day/session cookie behavior | 2 |
| P3.3 | Implement `/api/auth/logout` and `/api/auth/check` | Full auth route trio | 1 |
| P3.4 | Implement middleware page protection rules | Redirect unauthenticated to `/login` | 1 |
| P3.5 | Implement API auth guard helper for protected routes | 401 for unauthorized API calls | 1 |
| P3.6 | Add auth integration tests | Verified auth behavior | 1 |

**Exit Gate:** Login/logout/check + protected routes fully verified.

## P4 Shared UI System & Navigation Shell (Weight 9%)
**Goal:** Deliver consistent UI foundation and responsive nav.

| WP ID | Task | Output | Weight |
|---|---|---|---:|
| P4.1 | Implement design tokens (colors/typography/spacing) from spec | Tokenized theme in global CSS | 1 |
| P4.2 | Build reusable primitives (Button, Input, Card, Badge, Modal, Toast) | Shared components | 2 |
| P4.3 | Implement `/login` page UI + interaction | Production login page | 1 |
| P4.4 | Implement desktop sidebar layout | Main desktop navigation | 1 |
| P4.5 | Implement mobile bottom nav (always visible) | Main mobile navigation | 1 |
| P4.6 | Enforce mobile constraints (44px targets, no horizontal scroll) | Responsive compliance | 2 |
| P4.7 | Add loading/empty/error UI states templates | UX completeness baseline | 1 |

**Exit Gate:** Navigation and core UI system available for all feature pages.

## P5 Categories + Symptoms Modules (Weight 9%)
**Goal:** Complete dynamic symptom/category management core.

| WP ID | Task | Output | Weight |
|---|---|---|---:|
| P5.1 | Implement categories APIs (GET/POST/PUT/DELETE soft-delete) | Category backend complete | 2 |
| P5.2 | Implement symptoms APIs (CRUD + search + `isCommon` query) | Symptom backend complete | 2 |
| P5.3 | Build `/symptoms/manage` full UI flows | Add/edit/grid toggle/sort UI | 2 |
| P5.4 | Build `/symptoms` symptom search page | Symptom search UI | 1 |
| P5.5 | Add inline symptom-create capability contracts for medicines/blogs flows | Reusable symptom picker behavior | 1 |
| P5.6 | Add module tests (validation, uniqueness, soft delete, search) | Reliable symptom/category logic | 1 |

**Exit Gate:** Symptom lifecycle is fully dynamic and usable across modules.

## P6 Medicines Modules (Weight 13%)
**Goal:** Build full medicine inventory management and dosing APIs.

| WP ID | Task | Output | Weight |
|---|---|---|---:|
| P6.1 | Implement medicines list/create endpoints with lookups | `GET/POST /api/medicines` | 2 |
| P6.2 | Implement medicine detail/update/delete endpoints | `GET/PUT/DELETE /api/medicines/[id]` | 1 |
| P6.3 | Implement add/remove symptom linkage endpoints | junction table management | 1 |
| P6.4 | Implement take-dose endpoint with interval warning (never hard block) | dose logging behavior | 2 |
| P6.5 | Implement restock endpoint (single + bulk category) | stock reset behavior | 1 |
| P6.6 | Implement quick-access/low-stock/expiring endpoints | smart inventory queries | 1 |
| P6.7 | Build `/medicines` inventory page with filters and grouped view | full inventory UI | 2 |
| P6.8 | Build `/medicines/add` page with symptom linking | create medicine UI | 1 |
| P6.9 | Build `/medicines/[id]` detail page + dose/restock actions | detail flow UI | 1 |
| P6.10 | Build `/out-of-stock` and `/quick-access` pages | shopping + shortcuts UIs | 1 |

**Exit Gate:** Kit management complete for both regular and sick-day usage contexts.

## P7 Illness Episode Modules (Weight 14%)
**Goal:** Implement full illness lifecycle and dose timeline behavior.

| WP ID | Task | Output | Weight |
|---|---|---|---:|
| P7.1 | Implement episodes list/start endpoints | episode creation and listing | 2 |
| P7.2 | Implement active/single/update endpoints with grouped dose details | rich episode retrieval | 2 |
| P7.3 | Implement recover endpoint (duration calculation + closure) | recovery flow backend | 1 |
| P7.4 | Implement log-dose endpoint (kit vs external branching) | core sick-day logging | 2 |
| P7.5 | Implement episode add/remove symptom endpoints | dynamic symptom adjustments | 1 |
| P7.6 | Enforce single active episode rule in API + DB behavior | business rule guarantee | 1 |
| P7.7 | Build `/illness/start` zero-typing symptom-driven flow | start illness UI | 2 |
| P7.8 | Build `/illness/active` dashboard with two dose flows + close flow | active illness UI | 2 |
| P7.9 | Build `/illness/history` and `/illness/[id]` pages | full journal history UI | 1 |

**Exit Gate:** End-to-end “I’m sick” flow works exactly per documentation.

## P8 Blogs Modules (Weight 8%)
**Goal:** Implement editable, symptom-linked illness guides in DB.

| WP ID | Task | Output | Weight |
|---|---|---|---:|
| P8.1 | Implement blogs list/create and detail/update/delete endpoints | blog backend CRUD | 2 |
| P8.2 | Implement add/remove blog-symptom link endpoints | symptom linking backend | 1 |
| P8.3 | Implement blog auto-suggestion query logic by symptom overlap | recommendation engine | 1 |
| P8.4 | Build `/blogs` index page | published guide listing UI | 1 |
| P8.5 | Build `/blogs/[slug]` guide page with section anchors/warnings/related | full guide UI | 2 |
| P8.6 | Build `/blogs/manage` list + editor views | admin content management UI | 1 |

**Exit Gate:** Blogs are fully dynamic, manageable, and episode-suggestable.

## P9 Dashboard + Insights Modules (Weight 7%)
**Goal:** Build command center and health analytics.

| WP ID | Task | Output | Weight |
|---|---|---|---:|
| P9.1 | Implement dashboard aggregate service endpoint(s) | unified dashboard data source | 2 |
| P9.2 | Build `/` dashboard UI (actions, active banner, alerts, quick/recent blocks) | command center page | 2 |
| P9.3 | Implement `/api/usage` endpoint and usage query filters | usage log API | 1 |
| P9.4 | Implement `/api/insights` calculations | patterns/metrics API | 1 |
| P9.5 | Build `/insights` page cards and trend sections | insights UI | 1 |

**Exit Gate:** Dashboard and insights provide complete situational awareness.

## P10 QA, Security, Performance Hardening (Weight 7%)
**Goal:** Validate behavior, reliability, accessibility, and safety.

| WP ID | Task | Output | Weight |
|---|---|---|---:|
| P10.1 | Unit tests for core utilities, validation, algorithmic rules | stable core logic | 1 |
| P10.2 | Integration tests for all API groups | endpoint reliability | 2 |
| P10.3 | E2E tests for top user flows | flow correctness | 2 |
| P10.4 | Security review (auth bypass, input sanitization, cookie flags) | hardened app | 1 |
| P10.5 | Performance/a11y pass on key pages | production UX confidence | 1 |

**Exit Gate:** Test suite green, no critical security/accessibility/performance gaps.

## P11 Deployment, Ops, Handover (Weight 3%)
**Goal:** Ship to Vercel with operational readiness.

| WP ID | Task | Output | Weight |
|---|---|---|---:|
| P11.1 | Production env setup and secret validation | deployable env | 1 |
| P11.2 | Deploy and run post-deploy smoke suite | verified production release | 1 |
| P11.3 | Handover docs (runbook, backup/restore, seed/reset, known limits) | maintainability package | 1 |

**Exit Gate:** Production deployment complete and operational instructions documented.

---

## End-to-End Test Scenarios (Acceptance Criteria)
1. Valid login with remember-me sets persistent cookie for 30 days.
2. Valid login without remember-me sets session cookie.
3. Invalid credentials return inline error and no auth cookie.
4. Unauthenticated page access redirects to `/login`.
5. Unauthenticated protected API access returns `401`.
6. Category CRUD works with soft delete.
7. Symptom CRUD works with slug uniqueness.
8. Symptom search returns partial matches by query.
9. `isCommon=true` filter returns grid symptoms only.
10. Medicine creation links symptoms through `medicine_symptoms`.
11. Medicine list joins category and symptom data correctly.
12. Dose from kit reduces quantity and updates usage metadata.
13. Dose interval violation shows warning but still allows override path.
14. External medicine dose logs without inventory mutation.
15. Restock single medicine resets quantity to default.
16. Bulk restock by category resets all targeted medicines.
17. Low-stock endpoint returns quantity `<=3`.
18. Expiring endpoint returns medicines within 30-day window.
19. Starting episode creates `illness_episodes` + `episode_symptoms`.
20. Only one active episode is allowed at a time.
21. Active episode endpoint returns grouped full details.
22. Episode dose logging creates/uses episode-medicine row correctly.
23. Episode recovery sets `recoveryDate`, `isOngoing=false`, `durationDays`.
24. Episode history sorts newest-first with year grouping.
25. Blog CRUD works with draft/published states.
26. Blog symptom linking drives auto-suggestion ranking.
27. Blog page renders warning sections with warning style.
28. Dashboard surfaces active illness banner only when ongoing episode exists.
29. Dashboard alerts show expired/out-of-stock/low-stock/expiring states correctly.
30. Insights endpoint returns all required aggregate blocks.
31. Mobile view has no horizontal scrolling on key pages.
32. Critical mobile actions are above fold and tap targets are >=44px.

## Assumptions and Defaults
1. Runtime remains Next.js 16 + React 19 + TypeScript.
2. Static single-user auth is the only auth mode.
3. All non-auth business data is persisted in MongoDB.
4. `isExpired` is computed at read-time; stored flag is optional cache only.
5. `usage_logs` collection is implemented because routes/rules require it.
6. Soft-delete behavior is mandatory for categories, symptoms, medicines.
7. Blog delete means unpublish (`isPublished=false`), not hard delete.
8. No external services are added beyond MongoDB Atlas and Vercel.
9. Seed scripts are idempotent and safe to run repeatedly.
10. Full-spec-first means MVP shortcuts are not used.

## Progress Board Initialization (Starting Values)
| Phase | Weight | Current % | Weighted Contribution |
|---|---:|---:|---:|
| P0 | 4 | 0 | 0.00 |
| P1 | 7 | 0 | 0.00 |
| P2 | 11 | 0 | 0.00 |
| P3 | 8 | 0 | 0.00 |
| P4 | 9 | 0 | 0.00 |
| P5 | 9 | 0 | 0.00 |
| P6 | 13 | 0 | 0.00 |
| P7 | 14 | 0 | 0.00 |
| P8 | 8 | 0 | 0.00 |
| P9 | 7 | 0 | 0.00 |
| P10 | 7 | 0 | 0.00 |
| P11 | 3 | 0 | 0.00 |

**Overall implementation progress now:** `0.00%`
