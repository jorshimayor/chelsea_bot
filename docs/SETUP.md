BlueBanter TS — Production Setup Guide

Prerequisites
- Node 20+, `pnpm@9.11`, `vercel` CLI, GitHub account
- Accounts and keys: OpenRouter, Neon Postgres, Upstash Redis, API‑Football, Tavily, Nano Banana, X (Twitter) Developer, Sentry, optional OTLP collector

Clone & Install
- `git clone https://github.com/yourname/bluebanter-ts.git`
- `cd bluebanter-ts`
- `pnpm install`

Environment Variables
- Copy `env.example` → `.env` and fill:
- `OPENROUTER_API_KEY`, `NEON_DATABASE_URL`, `API_FOOTBALL_KEY`, `UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN`, `TAVILY_API_KEY`, `NANO_BANANA_API_KEY`, `X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_REDIRECT_URI`, `SENTRY_DSN`, `OTLP_ENDPOINT`
- Optional: `vercel link && vercel env pull` to sync hosted env

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
- Sentry DSN: set `SENTRY_DSN`
- OTLP collector: set `OTLP_ENDPOINT` if exporting traces

Edge & Gateway
- Vercel Edge Functions: defined under `api/*` (runtime=edge)
- Middleware emits `x-cold-start-ms` for cold‑start measurements
- Optional Cloudflare Worker in `apps/gateway`; publish later with Wrangler

Link X (Twitter) OAuth
- Ensure `X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_REDIRECT_URI` are set
- Deploy or run dev, then visit `/api/x/auth` to start OAuth
- After redirect, tokens persist in Postgres (`oauth_tokens`)

Run Locally
- `vercel dev` runs the Edge endpoints locally
- Visit `/api/index` for agent handler, `/api/x/auth` for OAuth

Deploy
- `vercel deploy --prod` for production
- Confirm Edge headers: `x-cold-start-ms`, `x-token-usage` on streamed responses

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
