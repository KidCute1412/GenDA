import { writeFile } from "node:fs/promises";

const baseUrl = process.env.API_URL ?? "http://localhost:3001";
const response = await fetch(new URL("/api/v1/openapi", baseUrl), {
  signal: AbortSignal.timeout(30_000)
});
if (!response.ok) throw new Error(`OpenAPI export failed: HTTP ${response.status}`);
const document = await response.json();
// Environment-specific server URLs would make checked-in artifacts nondeterministic.
delete document.servers;
await writeFile(new URL("../packages/api-client/openapi.json", import.meta.url),
  JSON.stringify(document, null, 2) + "\n");
