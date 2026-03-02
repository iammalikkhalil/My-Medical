# Risk Register

| ID | Risk | Impact | Mitigation | Status |
|---|---|---|---|---|
| R1 | Route contract drift between UI and API | High | Shared validators and typed payload contracts | Open |
| R2 | Session handling mismatch across middleware and routes | High | Single JWT utility in lib/auth.ts | Open |
| R3 | Dose interval logic inconsistency | High | Centralized dose apply helper in lib/dose.ts | Open |
| R4 | Query performance degradation on joins | Medium | Collection indexes + selective limits | Open |
| R5 | Missing data seeding for first-run UX | Medium | Idempotent seed script in scripts/seed.ts | Open |

