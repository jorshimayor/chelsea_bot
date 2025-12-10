export type Env = {
  OPENROUTER_API_KEY: string;
  NEON_DATABASE_URL: string;
  API_FOOTBALL_KEY?: string;
  UPSTASH_REDIS_URL?: string;
  UPSTASH_REDIS_TOKEN?: string;
  SENTRY_DSN?: string;
  TAVILY_API_KEY?: string;
  NANO_BANANA_API_KEY?: string;
  X_CLIENT_ID?: string;
  X_CLIENT_SECRET?: string;
  X_REDIRECT_URI?: string;
  OTLP_ENDPOINT?: string;
};

function requireEnv(key: keyof Env): string {
  const v = process.env[key as string];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

export const env: Env = {
  OPENROUTER_API_KEY: requireEnv("OPENROUTER_API_KEY"),
  NEON_DATABASE_URL: requireEnv("NEON_DATABASE_URL"),
  API_FOOTBALL_KEY: process.env.API_FOOTBALL_KEY,
  UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
  UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN,
  SENTRY_DSN: process.env.SENTRY_DSN,
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  NANO_BANANA_API_KEY: process.env.NANO_BANANA_API_KEY,
  X_CLIENT_ID: process.env.X_CLIENT_ID,
  X_CLIENT_SECRET: process.env.X_CLIENT_SECRET,
  X_REDIRECT_URI: process.env.X_REDIRECT_URI,
  OTLP_ENDPOINT: process.env.OTLP_ENDPOINT
};
