Run Guide — BlueBanter TS

Prerequisites
- Node 20+, pnpm 9.11
- Cloudflare account (for deploy) + Wrangler (installed via `pnpm install`)
- Providers configured in `.env` / `.dev.vars` (OpenRouter, Neon, Redis, API‑Football, Tavily, X OAuth, optional OTLP)

1) Install
- `pnpm install`

2) Configure Environment
- Copy `.env.example` → `.env` and fill the keys you need (used by `pnpm db:push`)
- Create `.dev.vars` for Wrangler dev (same keys, used at runtime)

3) Apply Database Schema
- `pnpm db:push` (applies `packages/db/schema.ts` to Neon)

4) Run Locally (Workers Dev)
- Run `pnpm dev` (bundles the Worker and starts `wrangler dev` on `http://localhost:3000`)
- Endpoints:
  - `/api/index` — Streams OpenRouter reply with `x-token-usage`
  - `/api/x/auth` — Initiates X OAuth PKCE; persists tokens to Postgres
  - `/api/cron/prewarm` — Prewarm route, returns `x-prewarm-ms` header

5) Verify Functionality
- Agent graph nodes and flow: see `apps/agent/src/graph.ts`
- Tool providers cache and citations: `packages/tools/index.ts`
- Image generation via OpenRouter: call `generateImage` in tools
- Streaming handler: `apps/agent/src/index.ts`

6) CI Budget Checks (GitHub Actions)
- On each push/PR: bundle size, cold‑start, token cap, DB query budget
- Run locally: `pnpm check:bundle`, `pnpm check:coldstart`, `pnpm check:tokens`, `pnpm check:dbqueries`

7) Deploy to Production
- `pnpm deploy` (builds and runs `wrangler deploy`)
- Confirm headers: `x-cold-start-ms`, `x-token-usage`

Troubleshooting
- Missing env causes startup errors via `requireEnv` in `packages/shared/env.ts`
- If Redis unavailable, falls back to in‑memory cache for tools
- If providers rate‑limit, warm cache results served from Postgres until TTL expiry

Useful Paths
- Agent graph: `apps/agent/src/graph.ts`
- Edge handler: `apps/agent/src/index.ts`
- DB schema: `packages/db/schema.ts`
- Tools suite: `packages/tools/index.ts`
- OpenRouter client: `packages/shared/openrouter.ts`
- X OAuth: `packages/shared/x.ts`, `api/x/*`
