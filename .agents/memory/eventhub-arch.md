---
name: EventHub architecture
description: Key decisions, quirks, and durable lessons for the EventHub platform.
---

# EventHub Architecture Notes

## Stack
- Frontend: `artifacts/eventhub` (React+Vite+Tailwind+shadcn, wouter for routing, @tanstack/react-query)
- Backend: `artifacts/api-server` (Express 5, pino, esbuild bundle via build.mjs)
- DB: `lib/db` (Drizzle + PostgreSQL), schema pushed, session table created manually
- API contract: `lib/api-spec/openapi.yaml` → codegen to `lib/api-client-react` + `lib/api-zod`

## Critical: connect-pg-simple must be externalized
`connect-pg-simple` reads a `table.sql` file at runtime relative to its own module path.
When esbuild bundles it into `dist/index.mjs`, `__dirname` resolves to `/dist/` and the file isn't found.
**Fix**: add `"connect-pg-simple"` to the `external` array in `artifacts/api-server/build.mjs`.

**Why**: esbuild inlines the module but loses the package's own data files; externalizing keeps the package resolvable at runtime from `node_modules`.

## Session table must be created manually
`connect-pg-simple` with `createTableIfMissing: true` fails when bundled (see above).
The session table was created manually via SQL:
```sql
CREATE TABLE IF NOT EXISTS "session" ("sid" varchar NOT NULL COLLATE "default", "sess" json NOT NULL, "expire" timestamp(6) NOT NULL, CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
```

## QR tokens: HMAC-signed, not plain IDs
Format: `base64url(payload).hmac_sig_16chars` where payload = `reg:<id>:<timestamp>`.
Verified in `artifacts/api-server/src/lib/auth.ts` (`generateQrToken` / `verifyQrToken`).
The QR_SECRET defaults to SESSION_SECRET env var.

## Orval/Zod compat
Orval v8 generates `from 'zod'` but catalog pins zod@^3. Post-processing patches import to `from 'zod/v4'`.
Run codegen via: `pnpm --filter @workspace/api-spec run codegen`.

## Demo accounts (password: demo1234)
- organizer@eventhub.demo (organizer role)
- volunteer@eventhub.demo (volunteer role)
- attendee@eventhub.demo / attendee2@eventhub.demo (attendee role)
Seed script: `pnpm --filter @workspace/api-server run seed`

## useGetEvent conditional query pattern
Orval-generated hooks require `queryKey` in the query options object (it's required, not optional).
Always include it alongside `enabled`:
```ts
useGetEvent(id, { query: { queryKey: ["getEvent", id], enabled: !!id } })
```
