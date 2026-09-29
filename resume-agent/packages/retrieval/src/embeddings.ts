import type { EmbeddingClient } from "./types.js";

export interface EmbeddingClientOptions {
  /** 以 /v1 结尾的 OpenAI 兼容地址，例如 https://api.siliconflow.cn/v1 */
  baseUrl: string;
  model: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
}

interface EmbeddingResponse {
  data?: Array<{ index?: number; embedding?: number[] }>;
}

/**
 * pi-ai 没有 embedding 接口，所以检索模块自己调用任意 OpenAI 兼容的 /v1/embeddings。
 * 向量维度以接口实际返回为准，不在这里写死。
 */
export function createEmbeddingClient(options: EmbeddingClientOptions): EmbeddingClient {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;
  return {
    model: options.model,
    async embed(texts: string[]): Promise<number[][]> {
      if (texts.length === 0) return [];
      const response = await fetchImpl(`${baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify({ model: options.model, input: texts }),
      });
      if (!response.ok) {
        const detail = (await response.text()).slice(0, 300);
        throw new Error(`向量接口返回 ${response.status}：${detail}`);
      }
      const payload = (await response.json()) as EmbeddingResponse;
      const ordered = [...(payload.data ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      const vectors = ordered.map((item) => item.embedding);
      if (vectors.length !== texts.length || vectors.some((vector) => !vector || vector.length === 0)) {
        throw new Error("向量接口没有返回与输入等长的 embedding");
      }
      const dimension = vectors[0]!.length;
      if (vectors.some((vector) => vector!.length !== dimension)) {
        throw new Error("同一次向量结果的维度不一致");
      }
      return vectors as number[][];
    },
  };
}

/** 换模型后维度可能变化，入库时按批请求，避免一次塞太多文本。 */
export async function embedInBatches(client: EmbeddingClient, texts: string[], batchSize = 16): Promise<number[][]> {
  const vectors: number[][] = [];
  for (let index = 0; index < texts.length; index += batchSize) {
    vectors.push(...(await client.embed(texts.slice(index, index + batchSize))));
  }
  return vectors;
}
