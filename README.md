# 💊MediTrack

Personal Medical Kit Web App built with Next.js App Router, MongoDB, and Mongoose.

## Features
- Static single-user auth with signed HTTP-only session cookie
- Medicine inventory management (stock, expiry, restock, quick access)
- Illness episode lifecycle (start, active dashboard, dose logging, recovery)
- External medicine logging (no kit mutation)
- Dynamic symptoms and categories
- Dynamic illness blogs/guides managed from DB
- Usage logs and insights endpoints
- Responsive navigation shell (desktop sidebar + mobile bottom nav)

## Stack
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- MongoDB Atlas + Mongoose
- Zod validation
- Vitest for test suite

## Environment
Create `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/medkit
MONGODB_DNS_SERVERS=
SESSION_SECRET=replace_with_32_plus_chars_secret
APP_USERNAME=admin
APP_PASSWORD=password
```

`MONGODB_DNS_SERVERS` is optional (comma-separated). Use it when SRV lookup fails in Node with errors like `querySrv ECONNREFUSED`:
`MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1`

## Scripts
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript check
- `npm test` - unit/integration tests with coverage
- `npm run seed` - seed categories/symptoms/blogs
- `npm run mongo:debug` - deep Mongo DNS/TCP and driver diagnostics
- `npm run check` - lint + typecheck + tests

## Progress Tracking Docs
- `docs/progress-tracker.md`
- `docs/traceability-matrix.md`
- `docs/dod-checklist.md`
- `docs/risk-register.md`

## Notes
- Next.js 16 prints a warning that `middleware.ts` is deprecated in favor of `proxy.ts`; functionality is still active.
- `usage_logs` is implemented as `UsageLog` model and `/api/usage` endpoint.
