import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createEmbeddingClient } from "../src/embeddings.js";
import { ResumeIndex, rebuildResumeIndex } from "../src/store.js";
import type { EmbeddingClient, ResumeChunk } from "../src/types.js";

const chunks: ResumeChunk[] = [
  {
    id: "proj-starmap",
    type: "project",
    title: "星图检索台",
    period: "2024.06 - 2025.02",
    tech_stack: ["React", "Node.js"],
    text: "示例项目。云栖实验室的 React 检索台，名叫星图。",
  },
  {
    id: "proj-harbor",
    type: "project",
    title: "港湾协作平台",
    period: "2023.03 - 2024.01",
    tech_stack: ["React", "TypeScript", "Node.js"],
    text: "示例项目。2023 年的 React 看板。",
  },
  {
    id: "proj-orders",
    type: "project",
    title: "订单同步服务",
    period: "2023.08 - 2024.06",
    tech_stack: ["Node.js", "TypeScript"],
    text: "示例项目。纯 Node.js 服务，没有 React。",
  },
  {
    id: "proj-ledger",
    type: "project",
    title: "票据归档小工具",
    period: "2021.04 - 2022.11",
    tech_stack: ["Vue", "Java"],
    text: "示例项目。2023 年之前的 Vue 工具。",
  },
  {
    id: "edu-example",
    type: "education",
    title: "示例理工大学",
    period: "2018.09 - 2022.06",
    tech_stack: [],
    text: "计算机科学与技术。",
  },
];

function hashEmbedding(text: string, dimension: number): number[] {
  const vector = Array.from({ length: dimension }, () => 0);
  for (let index = 0; index < text.length; index += 1) {
    vector[index % dimension] = (vector[index % dimension] ?? 0) + ((text.charCodeAt(index) % 97) - 48) / 48;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
}

function fakeClient(dimension: number, model = "fake-model"): EmbeddingClient {
  return {
    model,
    async embed(texts: string[]) {
      return texts.map((text) => hashEmbedding(text, dimension));
    },
  };
}

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

  it("混合检索、按类型和技术栈与年份过滤，并按 id 直读", async () => {
    const path = mkdtempSync(join(tmpdir(), "resume-lance-"));
    const client = fakeClient(8);
    const rebuilt = await rebuildResumeIndex({ path, chunks, client });
    expect(rebuilt).toEqual({ count: chunks.length, dimension: 8 });
    const index = new ResumeIndex(path, client);

    const byName = await index.search({ query: "星图" });
    expect(byName[0]?.id).toBe("proj-starmap");

    const reactAfter2023 = await index.search({
      query: "React",
      type: "project",
      techStack: "React",
      periodFrom: 2023,
    });
    expect(reactAfter2023.map((chunk) => chunk.id).sort()).toEqual(["proj-harbor", "proj-starmap"]);

    const education = await index.search({ query: "计算机", type: "education" });
    expect(education.map((chunk) => chunk.id)).toEqual(["edu-example"]);

    const project = await index.getById("proj-orders");
    expect(project?.text).toContain("没有 React");
    expect(project?.tech_stack).toEqual(["Node.js", "TypeScript"]);
    await expect(index.getById("missing")).resolves.toBeNull();
  });

  it("向量维度变化时要求重新入库", async () => {
    const path = mkdtempSync(join(tmpdir(), "resume-lance-dim-"));
    await rebuildResumeIndex({ path, chunks, client: fakeClient(8, "dim-8") });
    const mismatched = new ResumeIndex(path, fakeClient(4, "dim-4"));
    await expect(mismatched.search({ query: "星图" })).rejects.toThrow(/pnpm ingest/);
    await rebuildResumeIndex({ path, chunks, client: fakeClient(4, "dim-4") });
    const rebuilt = new ResumeIndex(path, fakeClient(4, "dim-4"));
    const hits = await rebuilt.search({ query: "星图" });
    expect(hits[0]?.id).toBe("proj-starmap");
  });
});
