## Scope & Objectives
- Implement the end‑to‑end BlueBanter agent per PRD with production reliability, low latency, and strict cost controls.
- Deliver a pnpm monorepo deployable to Vercel Edge with Cloudflare gateway, Neon + Drizzle, LangGraph.js, OpenRouter (Grok 4.1), tools, CI/observability.

## Assumptions
- OpenRouter Grok 4.1 fast free tier is available until ~Jan 2026, with graceful fallback routing.
- Neon Scale plan + pgvector is enabled; Upstash Kafka/Redis accounts exist or are added post‑MVP.
- X API Basic plan upgraded when needed; start in read‑only/limited publish during launch.

## Architecture Overview
- Edge‑first: Vercel Edge Functions for conversation handling; Cloudflare Worker as global gateway/WAF/rate limit.
- LangGraph.js `StateGraph` orchestrates ingress → user lookup → tone classification → parallel tools → synthesis → safety → image → publish → persist.
- Data: Neon Postgres via Drizzle ORM; caches in Upstash Redis edge; vector needs start with `pgvector` (optionally Pinecone later).
- Observability: Sentry, OpenTelemetry, Vercel Analytics, LogSnag; CI gates enforce budgets.

## Monorepo Setup
- Create pnpm workspace: `apps/agent`, `apps/gateway`, `packages/db`, `packages/shared`, `packages/tools`, `packages/observability`.
- TypeScript 5.6 strict mode; ESLint + Prettier; tsconfig project references; path aliases via `tsconfig.json` + `esbuild` bundling.
- Vercel config: `vercel.json` with Edge Functions, middleware, cron; bundle analyzer to enforce ≤10 MB.

## Environment & Secrets
- `.env` management via `vercel env pull` and Edge Config for non‑secret runtime toggles.
- Secrets: OpenRouter API key, Neon connection string, Upstash Kafka/Redis, Sentry DSN, Tavily, Nano Banana.
- Provide `env.example` and `apps/agent/src/config.ts` loader with validation (zod) and graceful missing key handling.

## Database & ORM
- Implement Drizzle schema per PRD in `packages/db/schema.ts` with `users`, `conversations`, `messages`, `quotes`, `news_cache`, `stat_cache`.
- Migrations via Drizzle Kit; `pnpm db:push` wires Neon.
- Indexes: `users_platform_idx`, `messages.convo_id` FK cascade; `stat_cache.key` PK; any needed partial indexes for `platform_message_id`.
- Connection pooling via Neon serverless + `@neondatabase/serverless` driver; retry/backoff.

## Agent Graph
- Define `AgentState` and compile `StateGraph` in `apps/agent/src/graph.ts` as specified, with `PostgresCheckpointer(neonConnection)` and `interruptBefore: ["safety"]`.
- Nodes:
  - `ingressNode`: normalize platform event → `Message`.
  - `userLookupNode`: fetch/create `users` + start/continue a `conversations` row.
  - `toneClassifierNode`: Grok 4.1 + deterministic fallback classifier (see Safety) → `tone`.
  - `parallelToolNode`: invoke parallel tools with per‑tool TTL and budget caps.
  - `synthesisNode`: compose final text with citations and model metadata; enforce token budget.
  - `safetyFilterNode`: content policy (no profanity slurs), Chelsea fan protection, rate limit escalations.
  - `imageGenerationNode`: Nano Banana Pro; CDN cache metadata.
  - `publishToXNode`: `twitter-api-v2` send or draft; backoff + idempotency.
  - `persistNode`: insert `messages`, update `conversations.last_active`.

## LLM Routing
- OpenRouter client: prefer `x-ai/grok-4.1-fast:free` with headers for token caps; fallbacks: `claude-3-5-sonnet-20241022` → `llama-3.1-405b` → `qwen-2.5-110b`.
- Auto‑rank by latency/price; collect per‑model telemetry.
- Deterministic tone classifier: small ruleset + tiny LM call; if classifier disagreements, prefer non‑savage.

## Tools Implementation
- `packages/tools` exports:
  - `getLiveEvents({ matchId? })`: API‑Football; low‑latency path, no cache.
  - `getPlayerStats({ name, season? })`: FBref + API‑Football; 6h cache.
  - `fetchQuotes({ player, days? })`: X semantic search + web; 24h cache.
  - `fetchNews({ player?, hours? })`: Tavily + RSS; 4h cache.
  - `fetchExpertCommentary({ player })`: web + YouTube; 48h cache.
  - `generateImage({ prompt, style: 'chelsea' })`: Nano Banana Pro; 24h CDN cache.
- Parallel execution via Grok 4.1 parallel tool calling; explicit per‑tool timeouts and budget.
- Mandatory verification: tool results must be referenced with citations in the final reply.

## Safety & Tone Controls
- Chelsea fan protection: `users.isChelseaFan` hard‑block savage roasting; add classifier guardrail; threshold tuned to ≤0.5% false positives.
- Banned phrase list integrated in synthesis; run `OpenAI content filter` style heuristics or Grok’s safety tools.
- Profanity/slur filters; platform policy compliance.

## Caching & Queues
- `stat_cache`/`news_cache` in Postgres for warm cache; Upstash Redis @edge for hot cache.
- Cache TTLs per PRD; cache keys normalized; cache bust on breaking news.
- Upstash Kafka topics for `publish-events`, `tool-events`, `alerts` (future‑ready).

## Edge Gateway & Publishing
- Cloudflare Worker: WAF, geo‑routing, rate limiting; routes requests to Vercel Edge.
- `twitter-api-v2` integration: OAuth 2.0 PKCE; store tokens securely; idempotent publishing; draft mode toggles via Edge Config.
- Webhook receivers for platform events (X, Discord, Telegram) mapping to `ingressNode`.

## Observability & CI
- Sentry setup across `apps/agent` and `apps/gateway` with release tags and sourcemaps.
- OpenTelemetry: trace each node and tool call; export to OTLP collector (or Vercel/Sentry).
- Vercel Analytics + LogSnag for real‑time counters.
- CI gates:
  - Edge bundle size ≤10 MB (bundle analyzer).
  - Cold start ≤180 ms (synthetic probe; fail build if exceeded).
  - Token usage ≤1,200 per reply (OpenRouter headers check).
  - Image generation ≤3.2 s average.
  - DB queries ≤4 per request (lightweight inspector).

## Performance & Cost Enforcement
- Streaming responses to reduce TTFB; early partials within 300 ms.
- Prewarm edge function via cron; use small entry module + dynamic imports for tools.
- Neon connection reuse; prepared statements; DRY queries.
- Cost monitor: track per‑reply token and per‑image cost; CI caps at scale tiers per matrix.

## Data Privacy & Security
- No secrets in logs; redact PII; least privilege DB roles.
- Signed webhooks; HMAC verification; replay protection.
- Strict CORS; Cloudflare WAF rules tuned for bot abuse.

## Testing & Verification
- Unit tests for nodes and tools; mock external APIs.
- Integration tests: end‑to‑end graph with synthetic conversations; verify citations and safety outcomes.
- Load tests: k6/Litestar Worker or Cloudflare test rig to 20k concurrent; measure p50/p99 latencies.
- Safety eval: labeled dataset of Chelsea fans; validate ≤0.5% false positives.

## Rollout & Operations
- Deploy with `vercel deploy --prod`; Cloudflare Worker publish.
- Feature flags: `savage` mode gate, image on/off, publish to draft.
- Runbooks: incident response, rate limit escalations, key rotation.

## Risks & Mitigations
- Grok free tier changes → robust fallback and reservoir throttling.
- API‑Football outage → cached stats + alternate provider.
- X rate limits → publish queue + backoff + drafts.

## Deliverables
- Monorepo with code, configs, migrations, CI, observability.
- 100 banter templates + banned‑phrase list.
- One‑click deploy; `pnpm db:push` and production deploy in <60 s.
- Documentation: setup, operations, safety policy, runbooks.