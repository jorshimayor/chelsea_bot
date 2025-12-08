import { build } from "esbuild";
await build({ entryPoints: ["middleware.ts"], bundle: true, platform: "browser", format: "esm", outfile: "dist/middleware.js" });
const mod = await import("../dist/middleware.js");
const res = mod.default(new Request("http://localhost/"));
const ms = res.headers.get("x-cold-start-ms");
if (ms && Number(ms) > 180) {
  console.error("Cold start too slow", ms);
  process.exit(1);
}
