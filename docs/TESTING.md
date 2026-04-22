Testing — BlueBanter TS

Setup
- Ensure `.env` is filled (OpenRouter, Neon, Redis, API‑Football, Tavily, X OAuth)
- Run `pnpm dev`

Streaming Reply
- `GET http://localhost:3000/api/index`
- Optional header: `x-citations: https://example.com https://another.example`
- Validate: streamed body, header `x-token-usage`

OAuth to X
- `GET http://localhost:3000/api/x/auth` (redirects to X)
- Complete flow; callback persists tokens to Postgres
- Validate: tokens exist in `oauth_tokens`

Tools Aggregation
- `GET http://localhost:3000/api/test/tools?player=Cole+Palmer&matchId=123&prompt=Chelsea+win`
- Validates providers and caching; returns citations and counts

Image Generation
- Included in tools aggregation; `imageUrl` should be present
- Confirms OpenRouter image generation

Cold‑Start Prewarm
- `GET http://localhost:3000/api/cron/prewarm`
- Header `x-prewarm-ms` exists; use in CI checks

Publish to X
- Dry run: `GET http://localhost:3000/api/x/publish?text=Test+post`
- Real post: `GET http://localhost:3000/api/x/publish?text=Test+post&confirm=1`
- Requires completed OAuth and non‑draft flags to be effective in graph; direct endpoint posts when `confirm=1`

Graph Run (Concept)
- The agent graph runs nodes inside the app; the `/api/index` endpoint streams LLM output directly.
- For full end‑to‑end via graph, set `config/flags.json`:
  - `image_generation_enabled: true`
  - `publish_draft_only: false`
- Implement a graph-backed endpoint if needed; current tools test covers providers and publishing endpoint covers X.
