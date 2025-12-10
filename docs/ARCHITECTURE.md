Architecture — BlueBanter TS

Monorepo Layout
- Apps: `apps/agent` (Vercel Edge), `apps/gateway` (Cloudflare Worker template)
- Packages: `packages/db`, `packages/tools`, `packages/shared`, `packages/observability`
- Data and Config: `data/*`, `config/flags.json`, `docs/*`

Edge‑First Design
- Vercel Edge Functions handle ingress, streaming synthesis, and publishing
- Middleware reports cold‑start via `x-cold-start-ms`

Agent State Machine (LangGraph‑style)
- Nodes defined in `apps/agent/src/graph.ts`
- `ingress` → `userLookup` → `toneClassifier` → `parallelTools` → `synthesis` → `safety` → `image` → `publish` → `persist`
- Workflow compile call: `apps/agent/src/graph.ts:100`
- `synthesis` node implementation: `apps/agent/src/graph.ts:70`
- `publishToXNode` implementation: `apps/agent/src/graph.ts:87`

Data Model (Drizzle ORM)
- Users: `packages/db/schema.ts:3`
- Conversations: `packages/db/schema.ts:15`
- Messages: `packages/db/schema.ts:23`
- News cache (warm): `packages/db/schema.ts:43`
- Stat cache (warm): `packages/db/schema.ts:50`
- OAuth tokens: `packages/db/schema.ts:55` (store X tokens)

LLM Routing & Streaming
- OpenRouter client via OpenAI SDK: `packages/shared/openrouter.ts`
- Streaming method `routeAndStream` with usage tracking
- Edge handler streams with `x-token-usage`: `apps/agent/src/index.ts`

Tools & Caching
- Providers: API‑Football, Tavily, RSS, Nano Banana
- Hot cache: Upstash Redis; Warm cache: Neon Postgres
- Tool implementations with `citation`: `packages/tools/index.ts`

Safety & Tone Controls
- Chelsea fan protection and banned phrases: `packages/shared/safety.ts`
- Tone‑aware template selection (Redis or local): `packages/shared/templates.ts`

Publishing Flow (X/Twitter)
- PKCE OAuth start/callback routes: `api/x/auth.ts`, `api/x/callback.ts`
- Tokens persisted: `oauth_tokens` table
- Idempotent publish with Redis `once` and flags in `config/flags.json`

Observability
- Sentry initialization in Edge: `apps/agent/src/index.ts`
- Lightweight OTLP exporter: `packages/observability/index.ts`
- Per‑node and per‑chunk tracing in synthesis

CI Budgets
- Bundle size ≤10 MB, cold‑start ≤180 ms, token cap ≤1200, DB queries ≤4
- Scripts in `scripts/*` enforce budgets

Gateway (Optional)
- Cloudflare Worker template with IP rate limiting: `apps/gateway/src/index.ts`

Performance Notes
- Redis hot cache prevents provider latency; Postgres warm cache sustains outages
- Streaming reduces TTFB and supports citations inline
- Edge middleware prewarm cron reduces cold‑start impact
