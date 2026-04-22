# BlueBanter TS

Production-grade AI agent monorepo running on Cloudflare Workers, with Neon + Drizzle, LangGraph.js, OpenRouter routing, tooling, and CI.

Quickstart
- Install: `pnpm install`
- Local env: copy `.env.example` → `.env` (DB migrations), and create `.dev.vars` (Wrangler runtime env)
- Apply DB schema: `pnpm db:push`
- Run locally: `pnpm dev` (serves `http://localhost:3000`)
- Deploy (production): `pnpm deploy`

