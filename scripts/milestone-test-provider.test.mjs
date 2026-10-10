import { test } from "node:test";
import assert from "node:assert/strict";
import { createMilestoneTestProvider } from "./milestone-test-provider.mjs";

test("test provider stores exact bytes and supplies verifiable quotes or deliberate failures", async () => {
  const server = createMilestoneTestProvider();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const object = base + "/storage/v1/object/milestone-deliverables/test";
    const headers = { Authorization: "Bearer test-storage-key" };
    assert.equal((await fetch(object, { method: "POST", headers, body: "Evidence" })).status, 200);
    assert.equal(await (await fetch(object, { headers })).text(), "Evidence");
    const analyze = text => fetch(base + "/models/test:generateContent", { method: "POST", headers: { "x-goog-api-key": "test-gemini-key" }, body: JSON.stringify({ contents: [{ parts: [{ text: JSON.stringify({ criteria: [{ id: "c1", text: "Form" }], sources: [{ id: "note", text }] }) }] }] }) });
    const result = await (await analyze("Evidence")).json();
    assert.equal(JSON.parse(result.candidates[0].content.parts[0].text).items[0].evidence[0].quote, "Evidence");
    assert.equal((await analyze("FAIL_AI")).status, 503);
    assert.equal((await analyze("QUOTA_AI")).status, 429);
    await fetch(object, { method: "DELETE", headers });
    assert.equal((await fetch(object, { headers })).status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
