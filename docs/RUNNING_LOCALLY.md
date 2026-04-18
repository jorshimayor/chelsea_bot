Running Chelsea Bot locally
===========================

Goal: get `http://localhost:3000` serving the dashboard and `/api/generate-tweet`
talking to Grok, without any secret ending up in git.

Prerequisites
-------------
- Node 20+
- pnpm 9 (`npm i -g pnpm@9.11.0`)
- Vercel CLI (`npm i -g vercel`)
- At minimum: an OpenRouter API key

Step 1 — Clone + install
------------------------
```
git clone https://github.com/jorshimayor/chelsea_bot.git
cd chelsea_bot
pnpm install
```

Step 2 — Secrets stay on your machine
-------------------------------------
`.env` is gitignored. Copy the template and fill in only what you have:

```
cp .env.example .env
```

Edit `.env`:

- **OPENROUTER_API_KEY** — required. Get it at https://openrouter.ai/keys.
- **API_FOOTBALL_KEY** — only needed if you'll test the dashboard fixtures card or the `/api/cron/*` routes.
- **NEON_DATABASE_URL** — only needed for cron routes (they persist to `messages`).
- **SENTRY_DSN** — optional, for error capture.
- **GEMINI_API_KEY** — optional slot if you want to swap models later.

> `.gitignore` blocks `.env` and every `.env.*` variant, and whitelists only `.env.example`. `git check-ignore .env` should confirm it's ignored before you commit anything.

Step 3 — Start the dev server
-----------------------------
```
pnpm dev
```

That script runs `vercel dev`, which serves:
- `http://localhost:3000/`                — the dashboard
- `http://localhost:3000/api/generate-tweet` — POST with `{kind, tone, data}`
- `http://localhost:3000/api/dashboard`     — JSON for the dashboard
- `http://localhost:3000/api/cron/fixtures` — daily fixtures cron (callable on-demand for testing)
- `http://localhost:3000/api/cron/weekly`   — weekly deep-dive cron
- `http://localhost:3000/api/cron/match-day`— match-day poller

Step 4 — Generate your first tweet
----------------------------------
1. Open http://localhost:3000
2. In the Tweet Studio card, leave it on `match_preview` + `professional` tone.
3. Click **Generate**.
4. You should see a 1-sentence Chelsea FC tweet ending in `#CFC 💙` with length ≤ 280.

curl alternative:
```
curl -s -X POST http://localhost:3000/api/generate-tweet \
  -H 'Content-Type: application/json' \
  -d '{
    "kind": "match_preview",
    "tone": "professional",
    "data": {
      "opponent": "Arsenal",
      "competition": "Premier League",
      "date": "Sat 3 PM",
      "venue": "Stamford Bridge"
    }
  }' | jq
```

Step 5 — Stay in draft mode until you trust it
----------------------------------------------
In `config/flags.json`:
```json
{ "publish_draft_only": true }
```
Keep that as `true` while testing. The cron jobs will generate + persist drafts
but will never call the X API. Flip to `false` only after you've connected
`/api/x/auth` and confirmed tokens exist in `oauth_tokens`.

Troubleshooting
---------------
- **`Missing env: OPENROUTER_API_KEY`** — your `.env` isn't loading. Make sure you ran `vercel dev`, not plain `node`, and the file is literally named `.env` (no trailing spaces, no `.env.txt`).
- **`404` on `/api/generate-tweet`** — confirm the `vercel dev` log lists `api/generate-tweet.ts` among its discovered routes.
- **`500 Missing env: NEON_DATABASE_URL`** — you're hitting a route that uses the DB (any `/api/cron/*` or `/api/dashboard`). Either fill `NEON_DATABASE_URL` or stick to `/api/generate-tweet`, which doesn't need Postgres.
- **CORS / fetch error from the dashboard** — browsers block file://. Open the dashboard via the dev server (http://localhost:3000/) not the raw file.
