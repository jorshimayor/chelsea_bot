BlueBanter TS — Production Setup Guide

Prerequisites
- Node 20+, `pnpm@9.11`, Cloudflare account, GitHub account
- Accounts and keys: OpenRouter, Neon Postgres, Upstash Redis, API‑Football, Tavily, Nano Banana, X (Twitter) Developer, optional OTLP collector

Clone & Install
- `git clone https://github.com/yourname/bluebanter-ts.git`
- `cd bluebanter-ts`
- `pnpm install`

Environment Variables
- Copy `.env.example` → `.env` and fill (see `docs/RUNNING_LOCALLY.md` for the minimal key set):
- `OPENROUTER_API_KEY`, `NEON_DATABASE_URL`, `API_FOOTBALL_KEY`, `UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN`, `TAVILY_API_KEY`, `NANO_BANANA_API_KEY`, `X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_REDIRECT_URI`, `SENTRY_DSN`, `OTLP_ENDPOINT`
- For local dev runtime, also create `.dev.vars` (Wrangler) with the same keys

Database (Neon + Drizzle)
- Create a Neon serverless Postgres project and get the direct connection string
- Set `NEON_DATABASE_URL` in `.env`
- `pnpm db:push` to apply schema (`packages/db/schema.ts`) to Neon

Redis (Upstash)
- Create an Upstash Redis database (Global)
- Set `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN`
- Used for hot cache, idempotency, and OAuth verifiers

Provider Keys
- OpenRouter: get a key → set `OPENROUTER_API_KEY`
- API‑Football: set `API_FOOTBALL_KEY`
- Tavily: set `TAVILY_API_KEY`
- Nano Banana: set `NANO_BANANA_API_KEY`

Observability
- OTLP collector: set `OTLP_ENDPOINT` if exporting traces

Runtime
- Cloudflare Worker routes requests to the existing handlers in `api/*`
- Cron triggers are defined in `wrangler.toml` and call the `/api/cron/*` routes

Link X (Twitter) OAuth
- Ensure `X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_REDIRECT_URI` are set
- Deploy or run dev, then visit `/api/x/auth` to start OAuth
- After redirect, tokens persist in Postgres (`oauth_tokens`)

Run Locally
- `pnpm dev` runs Wrangler dev on `http://localhost:3000`
- Visit `/api/index` for agent handler, `/api/x/auth` for OAuth

Deploy
- `pnpm deploy` (builds and runs `wrangler deploy`)
- Set secrets with Wrangler (prod):
  - `pnpm exec wrangler secret put OPENROUTER_API_KEY`
  - `pnpm exec wrangler secret put NEON_DATABASE_URL`
  - Add any other provider keys you use

Feature Flags
- Edit `config/flags.json` to toggle `savage_mode_enabled`, `image_generation_enabled`, `publish_draft_only`

CI & Budgets
- GitHub Actions in `.github/workflows/ci.yml`
- Scripts enforce: bundle ≤10 MB, cold‑start ≤180 ms, token cap ≤1200, DB queries ≤4

Common Checks
- Missing env → runtime throws with `requireEnv`
- Redis unavailable → caches fall back to in‑memory
- Provider outages → warm cache (Postgres) serves until TTL expiry

Project Map
- Agent graph: `apps/agent/src/graph.ts`
- Edge handler streaming: `apps/agent/src/index.ts`
- DB schema & client: `packages/db/schema.ts`, `packages/db/client.ts`
- Tools: `packages/tools/index.ts`
- OpenRouter client: `packages/shared/openrouter.ts`
- OAuth/X: `packages/shared/x.ts`, `api/x/*`
- Redis & templates: `packages/shared/redis.ts`, `packages/shared/templates.ts`

Next Steps
- Add additional providers, expand streaming synthesis, and wire full OTel SDK if desired
