import { build } from "esbuild";
const result = await build({ entryPoints: ["api/index.ts"], bundle: true, platform: "browser", format: "esm", outfile: "dist/bundle.js" });
const fs = await import("fs");
const stats = fs.statSync("dist/bundle.js");
if (stats.size > 10 * 1024 * 1024) {
  console.error("Bundle too large", stats.size);
  process.exit(1);
}
