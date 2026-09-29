import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as lancedb from "@lancedb/lancedb";
import { embedInBatches } from "./embeddings.js";
import { parsePeriod } from "./period.js";
import type { EmbeddingClient, ResumeChunk, SearchQuery } from "./types.js";

const TABLE = "chunks";
const META_FILE = "resume-meta.json";

interface IndexMeta {
  model: string;
  dimension: number;
}

interface StoredRow {
  id: string;
  type: string;
  title: string;
  period: string;
  tech_stack_json: string;
  tech_stack_text: string;
  text: string;
  search_text: string;
  start_year: number;
  end_year: number;
  vector: number[];
}

function techText(stack: string[]): string {
  const tokens = stack.map((item) => item.trim().toLowerCase()).filter(Boolean);
  return tokens.length ? `|${tokens.join("|")}|` : "|";
}

function searchText(chunk: ResumeChunk): string {
  return [chunk.title, chunk.period, chunk.tech_stack.join(" "), chunk.text].filter(Boolean).join("\n");
}

function readMeta(path: string): IndexMeta | null {
  try {
    return JSON.parse(readFileSync(join(path, META_FILE), "utf8")) as IndexMeta;
  } catch {
    return null;
  }
}

function writeMeta(path: string, meta: IndexMeta): void {
  mkdirSync(path, { recursive: true });
  writeFileSync(join(path, META_FILE), JSON.stringify(meta, null, 2));
}

function escapeLike(value: string): string {
  return value.replaceAll("'", "").trim().toLowerCase();
}

function buildWhere(query: SearchQuery): string | undefined {
  const parts: string[] = [];
  if (query.type) parts.push(`type = '${query.type}'`);
  const tech = query.techStack ? escapeLike(query.techStack) : "";
  if (tech) parts.push(`tech_stack_text LIKE '%|${tech}|%'`);
  if (query.periodFrom !== undefined) {
    if (!Number.isInteger(query.periodFrom)) throw new Error("period_from 必须是整数年份");
    parts.push(`end_year >= ${query.periodFrom}`);
  }
  if (query.periodTo !== undefined) {
    if (!Number.isInteger(query.periodTo)) throw new Error("period_to 必须是整数年份");
    parts.push(`start_year <= ${query.periodTo}`);
  }
  return parts.length ? parts.join(" AND ") : undefined;
}

function rowToChunk(row: Record<string, unknown>): ResumeChunk {
  const tech = typeof row.tech_stack_json === "string" ? (JSON.parse(row.tech_stack_json) as unknown) : [];
  return {
    id: String(row.id ?? ""),
    type: row.type as ResumeChunk["type"],
    title: String(row.title ?? ""),
    period: String(row.period ?? ""),
    tech_stack: Array.isArray(tech) ? tech.map((item) => String(item)) : [],
    text: String(row.text ?? ""),
  };
}

async function createFtsIndex(table: lancedb.Table): Promise<void> {
  await table.createIndex("search_text", {
    config: lancedb.Index.fts({
      baseTokenizer: "ngram",
      ngramMinLength: 2,
      ngramMaxLength: 4,
      lowercase: true,
      stem: false,
      removeStopWords: false,
    }),
  });
}

export interface RebuildOptions {
  path: string;
  chunks: ResumeChunk[];
  client: EmbeddingClient;
}

/** 整表重建。换 embedding 模型时必须走这里，因为向量维度可能变了。 */
export async function rebuildResumeIndex(options: RebuildOptions): Promise<{ count: number; dimension: number }> {
  if (options.chunks.length === 0) throw new Error("没有可写入的简历片段");
  const vectors = await embedInBatches(
    options.client,
    options.chunks.map((chunk) => searchText(chunk)),
  );
  const dimension = vectors[0]?.length ?? 0;
  if (!dimension || vectors.some((vector) => vector.length !== dimension)) {
    throw new Error("embedding 维度不一致，已中止重建");
  }
  const rows: StoredRow[] = options.chunks.map((chunk, index) => {
    const years = parsePeriod(chunk.period);
    return {
      id: chunk.id,
      type: chunk.type,
      title: chunk.title,
      period: chunk.period,
      tech_stack_json: JSON.stringify(chunk.tech_stack),
      tech_stack_text: techText(chunk.tech_stack),
      text: chunk.text,
      search_text: searchText(chunk),
      start_year: years.startYear,
      end_year: years.endYear,
      vector: vectors[index] ?? [],
    };
  });
  mkdirSync(options.path, { recursive: true });
  const db = await lancedb.connect(options.path);
  const table = await db.createTable(TABLE, rows as unknown as Record<string, unknown>[], { mode: "overwrite" });
  await createFtsIndex(table);
  writeMeta(options.path, { model: options.client.model, dimension });
  return { count: rows.length, dimension };
}

export class ResumeIndex {
  private tablePromise: Promise<lancedb.Table> | null = null;

  constructor(
    private readonly path: string,
    private readonly client: EmbeddingClient,
  ) {}

  private async table(): Promise<lancedb.Table> {
    if (!this.tablePromise) {
      this.tablePromise = lancedb.connect(this.path).then((db) => db.openTable(TABLE));
    }
    try {
      return await this.tablePromise;
    } catch {
      this.tablePromise = null;
      throw new Error("还没有简历索引，或索引已损坏。请先运行 pnpm ingest。");
    }
  }

  private assertDimension(vector: number[]): void {
    const meta = readMeta(this.path);
    if (!meta) {
      throw new Error("找不到索引元数据。请重新运行 pnpm ingest。");
    }
    if (vector.length !== meta.dimension) {
      throw new Error(
        `当前向量维度是 ${vector.length}，索引是 ${meta.dimension}（模型 ${meta.model}）。维度不一致，请重新运行 pnpm ingest。`,
      );
    }
  }

  async search(query: SearchQuery): Promise<ResumeChunk[]> {
    const table = await this.table();
    const limit = Math.min(Math.max(query.limit ?? 6, 1), 10);
    const where = buildWhere(query);
    const text = query.query.trim();
    if (!text) {
      let scan = table.query().select(["id", "type", "title", "period", "tech_stack_json", "text"]).limit(limit);
      if (where) scan = scan.where(where);
      const rows = (await scan.toArray()) as Record<string, unknown>[];
      return rows.map(rowToChunk);
    }
    const [vector] = await this.client.embed([text]);
    if (!vector) throw new Error("查询没有得到向量");
    this.assertDimension(vector);
    const reranker = await lancedb.rerankers.RRFReranker.create();
    let hybrid = table
      .query()
      .nearestTo(vector)
      .fullTextSearch(text)
      .rerank(reranker)
      .select(["id", "type", "title", "period", "tech_stack_json", "text"])
      .limit(limit);
    if (where) hybrid = hybrid.where(where);
    const rows = (await hybrid.toArray()) as Record<string, unknown>[];
    return rows.map(rowToChunk);
  }

  async getById(id: string): Promise<ResumeChunk | null> {
    if (!/^[A-Za-z0-9_-]+$/.test(id)) return null;
    const table = await this.table();
    const rows = (await table
      .query()
      .where(`id = '${id}'`)
      .select(["id", "type", "title", "period", "tech_stack_json", "text"])
      .limit(1)
      .toArray()) as Record<string, unknown>[];
    return rows[0] ? rowToChunk(rows[0]) : null;
  }
}
