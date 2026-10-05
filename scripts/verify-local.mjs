import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const backend = process.env.API_URL ?? "http://localhost:3001";
const frontend = process.env.FRONTEND_URL ?? "http://localhost:3000";
async function health(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  assert.equal(response.status, 200, `Health failed: ${url}`);
  assert.deepEqual(await response.json(), { status: "ok", service: "genda-api" });
}
const compose = (...args) => execFileSync("docker", ["compose", ...args], {
  cwd: new URL("../", import.meta.url), encoding: "utf8"
});
const history = () => compose("exec", "-T", "database", "sh", "-c",
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT version, checksum, success FROM flyway_schema_history ORDER BY installed_rank"').trim();

await health(`${backend}/api/v1/health`);
await health(`${frontend}/api/health`);
const allowed = await fetch(`${backend}/api/v1/health`, { headers: { Origin: frontend } });
assert.equal(allowed.headers.get("access-control-allow-origin"), frontend);
const denied = await fetch(`${backend}/api/v1/health`, { headers: { Origin: "https://untrusted.invalid" } });
assert.equal(denied.headers.get("access-control-allow-origin"), null);
const before = history();
assert.match(before, /^1\|.*\|t/m, "Flyway baseline must have succeeded");
compose("restart", "backend");
let ready = false;
for (let attempt = 0; attempt < 60; attempt++) {
  try { await health(`${backend}/api/v1/health`); ready = true; break; }
  catch { await new Promise(resolve => setTimeout(resolve, 1000)); }
}
assert.ok(ready, "Backend did not become ready after restart");
assert.equal(history(), before, "Applied migrations changed after restart");
await health(`${frontend}/api/health`);
console.log("PASS: health, frontend/API/database connectivity, CORS and Flyway restart persistence.");
