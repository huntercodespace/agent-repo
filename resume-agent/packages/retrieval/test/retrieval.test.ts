import { describe, expect, it } from "vitest";
import { createEmbeddingClient } from "../src/embeddings.js";

describe("检索", () => {
  it("调用 OpenAI 兼容的 embeddings 接口", async () => {
    const seen: { url?: string; authorization?: string; model?: string; input?: string[] } = {};
    const client = createEmbeddingClient({
      baseUrl: "https://api.siliconflow.cn/v1/",
      model: "BAAI/bge-m3",
      apiKey: "test-key",
      fetchImpl: async (url, init) => {
        seen.url = String(url);
        seen.authorization = new Headers(init?.headers).get("authorization") ?? "";
        const body = JSON.parse(String(init?.body)) as { model: string; input: string[] };
        seen.model = body.model;
        seen.input = body.input;
        return new Response(
          JSON.stringify({
            data: body.input.map((_item, index) => ({ index: body.input.length - 1 - index, embedding: [index, 1, 2] })),
          }),
          { status: 200 },
        );
      },
    });
    await expect(client.embed([])).resolves.toEqual([]);
    const vectors = await client.embed(["甲", "乙"]);
    expect(seen.url).toBe("https://api.siliconflow.cn/v1/embeddings");
    expect(seen.authorization).toBe("Bearer test-key");
    expect(seen.model).toBe("BAAI/bge-m3");
    expect(vectors).toEqual([
      [1, 1, 2],
      [0, 1, 2],
    ]);
  });
});
