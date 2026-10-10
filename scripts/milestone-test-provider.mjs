// Test-only HTTP fixtures. Never point a production backend at this server.
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

export function createMilestoneTestProvider() {
  const objects = new Map();
  let calls = 0;
  return createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const answer = (status, value) => { response.writeHead(status, { "Content-Type": "application/json" }); response.end(JSON.stringify(value)); };
    try {
      if (request.url === "/_test/stats") return answer(200, { calls, objects: objects.size });
      if (request.url.startsWith("/storage/v1/object/milestone-deliverables/")) {
        if (request.headers.authorization !== "Bearer test-storage-key") return answer(401, {});
        if (request.method === "POST") { objects.set(request.url, body); return answer(200, { Key: request.url }); }
        if (request.method === "DELETE") { objects.delete(request.url); return answer(200, {}); }
        if (!objects.has(request.url)) return answer(404, {});
        response.writeHead(200, { "Content-Type": "application/octet-stream" }); return response.end(objects.get(request.url));
      }
      if (request.url.endsWith(":generateContent")) {
        if (request.headers["x-goog-api-key"] !== "test-gemini-key") return answer(401, {});
        calls++;
        const payload = JSON.parse(body);
        const input = JSON.parse(payload.contents[0].parts[0].text);
        const text = input.sources.map(source => source.text).join(" ");
        if (text.includes("QUOTA_AI")) return answer(429, {});
        if (text.includes("FAIL_AI")) return answer(503, {});
        const report = {
          items: input.criteria.map(criterion => {
            const source = input.sources[0];
            const ambiguous = criterion.text.includes("đẹp");
            const missing = criterion.text.includes("thiếu");
            return {
              criterionId: criterion.id,
              status: ambiguous ? "CANNOT_ASSESS" : missing ? "NOT_SHOWN" : "EVIDENCE_FOUND",
              evidence: ambiguous || missing ? [] : [{ source: source.id, quote: text.includes("BAD_QUOTE") ? "Fabricated quote" : source.text.slice(0, 100) }],
              question: ambiguous ? "SME có thể đánh giá phần này trực tiếp không?" : null
            };
          }),
          overallNote: "Đây là dữ liệu AI fixture dùng cho kiểm thử, không phải phân tích từ Gemini thật."
        };
        return answer(200, { candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(report) }] } }], usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 100 } });
      }
      answer(404, {});
    } catch { answer(400, {}); }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createMilestoneTestProvider().listen(Number(process.env.PORT ?? 3039), "0.0.0.0", () => console.log("Milestone test fixtures listening on port " + (process.env.PORT ?? 3039)));
}
