import assert from "node:assert";
import { filterContent, protectChelseaFan } from "../../packages/shared/safety";

const filtered = filterContent("racist slur test");
assert.strictEqual(filtered.includes("racist"), false);
assert.strictEqual(filtered.includes("slur"), false);

const s = protectChelseaFan({ messages: [], user: { id: 1, platform: "x", isChelseaFan: true, rivalIntensity: 0 }, tone: "savage", toolsNeeded: [] });
assert.strictEqual(s.tone, "professional");
