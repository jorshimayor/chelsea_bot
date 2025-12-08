import { models } from "../packages/shared/openrouter.js";
const cap = models?.[0]?.maxOutputTokens || 0;
if (cap > 1200) {
  console.error("Token cap exceeded", cap);
  process.exit(1);
}
