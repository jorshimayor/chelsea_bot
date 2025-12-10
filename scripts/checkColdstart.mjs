import { build } from "esbuild";
await build({
  entryPoints: ["api/cron/prewarm.ts"],
  bundle: true,
  platform: "browser",
  format: "esm",
  outfile: "dist/prewarm.js",
});
const mod = await import("../dist/prewarm.js");
const res = await mod.default(new Request("http://localhost/"));
const ms = res.headers.get("x-prewarm-ms");
if (ms && Number(ms) > 180) {
  console.error("Cold start too slow", ms);
  process.exit(1);
}
