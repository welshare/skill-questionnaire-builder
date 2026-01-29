// ---------------------------------------------------------------------------
// @welshare/sdk  –  public API surface
// ---------------------------------------------------------------------------

// Types – records
export type {
  NillionRecord,
  QuestionnaireResponseRecord,
  BinaryFileRecord,
} from "./types/records";

// Types – aggregation
export type {
  TimeBucket,
  TimeRange,
  QuestionnaireResponseStatsQuery,
  BinaryUploadStatsQuery,
  BucketedCount,
  CollectionStatsResult,
} from "./types/aggregation";

// Nillion client interface & helpers
export type { NillionCollectionReader, NillionFilter } from "./nillion/client";
export { COLLECTIONS, InMemoryCollectionReader } from "./nillion/client";

// Aggregation utilities
export { floorToBucket, advanceBucket, generateBucketRanges, bucketKey } from "./aggregations/time-buckets";
export { aggregateBucketedCounts } from "./aggregations/group-by";

// High-level stats facade
export { CollectionStats } from "./aggregations/collection-stats";
