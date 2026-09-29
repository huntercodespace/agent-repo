export { chunkEntries } from "./chunk.js";
export { createEmbeddingClient, embedInBatches } from "./embeddings.js";
export { parseMarkdownEntry } from "./markdown.js";
export { parsePeriod } from "./period.js";
export { loadProfile, loadResumeDirectory } from "./sources.js";
export { ResumeIndex, rebuildResumeIndex } from "./store.js";
export type {
  ChunkType,
  ContactInfo,
  EmbeddingClient,
  Profile,
  RawEntry,
  ResumeChunk,
  SearchQuery,
} from "./types.js";
export { CHUNK_TYPES } from "./types.js";
