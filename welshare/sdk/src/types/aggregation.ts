/**
 * Supported time-bucket granularities.
 */
export type TimeBucket = "hour" | "day" | "week";

/**
 * A half-open time range [from, to).
 * Both bounds are ISO-8601 strings or Date objects.
 */
export interface TimeRange {
  from: Date | string;
  to: Date | string;
}

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------

export interface QuestionnaireResponseStatsQuery {
  /** Time window to consider.  Defaults to "last 24 h" when omitted. */
  range?: TimeRange;
  /** Bucket granularity.  Defaults to "day". */
  bucket?: TimeBucket;
  /** Group results by this field.  Defaults to "application_id". */
  groupBy?: "application_id" | "publisher_id";
  /** Optional filter: only count responses for these application IDs. */
  applicationIds?: string[];
  /** Optional filter: only count responses for these publisher IDs. */
  publisherIds?: string[];
}

export interface BinaryUploadStatsQuery {
  /** Time window to consider.  Defaults to "last 24 h" when omitted. */
  range?: TimeRange;
  /** Bucket granularity.  Defaults to "day". */
  bucket?: TimeBucket;
  /** Group results by this field.  Defaults to "uploader_did". */
  groupBy?: "uploader_did" | "application_id";
  /** Optional filter: only count uploads from these DIDs. */
  uploaderDids?: string[];
  /** Optional filter: only count uploads for these content types. */
  contentTypes?: string[];
}

// ---------------------------------------------------------------------------
// Result shapes
// ---------------------------------------------------------------------------

/**
 * One row inside an aggregated result set.
 *
 * Example:
 * ```
 * { bucketStart: "2025-06-10T00:00:00Z", group: "app-abc", count: 42 }
 * ```
 */
export interface BucketedCount {
  /** ISO-8601 start of the bucket. */
  bucketStart: string;
  /** ISO-8601 end of the bucket (exclusive). */
  bucketEnd: string;
  /** The group key value (e.g. an application_id or uploader DID). */
  group: string;
  /** Number of records in this bucket + group. */
  count: number;
}

/**
 * Full stats result returned by an aggregation query.
 */
export interface CollectionStatsResult {
  /** Human-readable label for the query (e.g. "Questionnaire responses"). */
  label: string;
  /** The time range that was queried. */
  range: { from: string; to: string };
  /** Bucket granularity used. */
  bucket: TimeBucket;
  /** Field used for grouping. */
  groupBy: string;
  /** Total record count across all buckets / groups. */
  totalCount: number;
  /** Distinct group values seen. */
  groups: string[];
  /** Bucketed + grouped counts. */
  buckets: BucketedCount[];
}
