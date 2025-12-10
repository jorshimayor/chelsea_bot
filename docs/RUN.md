Run Guide — BlueBanter TS

Prerequisites
- Node 20+, pnpm 9.11, Vercel CLI
- Providers configured in `.env` (OpenRouter, Neon, Redis, API‑Football, Tavily, Nano Banana, X OAuth, Sentry)

1) Install
- `pnpm install`

2) Configure Environment
- Copy `env.example` → `.env` and fill all keys
- Optional: `vercel link && vercel env pull` to sync hosted env

3) Apply Database Schema
- `pnpm db:push` (applies `packages/db/schema.ts` to Neon)

4) Run Locally (Edge Dev)
- Run `vercel dev` directly (do not wrap it via `pnpm dev`)
- Endpoints:
  - `/api/index` — Streams OpenRouter reply with `x-token-usage`
  - `/api/x/auth` — Initiates X OAuth PKCE; persists tokens to Postgres
  - `/api/cron/prewarm` — Edge prewarm
  - Middleware adds `x-cold-start-ms` header

5) Verify Functionality
- Agent graph nodes and flow: see `apps/agent/src/graph.ts`
- Tool providers cache and citations: `packages/tools/index.ts`
- Streaming handler and Sentry: `apps/agent/src/index.ts`

6) CI Budget Checks (GitHub Actions)
- On each push/PR: bundle size, cold‑start, token cap, DB query budget
- Run locally: `pnpm check:bundle`, `pnpm check:coldstart`, `pnpm check:tokens`, `pnpm check:dbqueries`

7) Deploy to Production
- `vercel deploy --prod`
- Confirm headers: `x-cold-start-ms`, `x-token-usage`

Troubleshooting
- Missing env causes startup errors via `requireEnv` in `packages/shared/env.ts`
- If Redis unavailable, falls back to in‑memory cache for tools
- If providers rate‑limit, warm cache results served from Postgres until TTL expiry
- Recursive invocation error:
- If you see "`vercel dev` must not recursively invoke itself", clear the Project Settings → Development Command in Vercel dashboard (remove `pnpm dev`) and run `vercel dev` directly from your terminal.

Useful Paths
- Agent graph: `apps/agent/src/graph.ts`
- Edge handler: `apps/agent/src/index.ts`
- DB schema: `packages/db/schema.ts`
- Tools suite: `packages/tools/index.ts`
- OpenRouter client: `packages/shared/openrouter.ts`
- X OAuth: `packages/shared/x.ts`, `api/x/*`
