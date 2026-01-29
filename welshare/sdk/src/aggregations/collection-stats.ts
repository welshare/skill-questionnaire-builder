import type {
  QuestionnaireResponseStatsQuery,
  BinaryUploadStatsQuery,
  CollectionStatsResult,
  TimeBucket,
} from "../types/aggregation";
import type {
  QuestionnaireResponseRecord,
  BinaryFileRecord,
} from "../types/records";
import {
  COLLECTIONS,
  type NillionCollectionReader,
  type NillionFilter,
} from "../nillion/client";
import { toDate } from "./time-buckets";
import { aggregateBucketedCounts } from "./group-by";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function defaultRange(): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  return { from, to };
}

function resolveRange(range?: { from: Date | string; to: Date | string }): {
  from: Date;
  to: Date;
} {
  if (!range) return defaultRange();
  return { from: toDate(range.from), to: toDate(range.to) };
}

// ---------------------------------------------------------------------------
// CollectionStats
// ---------------------------------------------------------------------------

/**
 * High-level facade that runs aggregation queries against Nillion
 * collections.
 *
 * Because Nillion SecretVault does not expose server-side aggregation
 * (no `$group`, no `COUNT`, etc.), this class:
 *
 * 1. Builds a filter that narrows the result set as much as possible
 *    (time range + optional ID predicates).
 * 2. Fetches the matching records from the collection.
 * 3. Performs client-side bucketing and grouping.
 *
 * Usage:
 * ```ts
 * const stats = new CollectionStats(myNillionReader);
 *
 * const result = await stats.questionnaireResponses({
 *   range: { from: "2025-06-01", to: "2025-06-08" },
 *   bucket: "day",
 *   groupBy: "publisher_id",
 * });
 * ```
 */
export class CollectionStats {
  constructor(private reader: NillionCollectionReader) {}

  // -----------------------------------------------------------------------
  // Questionnaire responses
  // -----------------------------------------------------------------------

  async questionnaireResponses(
    query: QuestionnaireResponseStatsQuery = {},
  ): Promise<CollectionStatsResult> {
    const { from, to } = resolveRange(query.range);
    const bucket: TimeBucket = query.bucket ?? "day";
    const groupBy = query.groupBy ?? "application_id";

    // Build filter for the Nillion query
    const filter: NillionFilter = {
      submitted_at: { $gte: from.toISOString(), $lt: to.toISOString() },
    };

    if (query.applicationIds?.length === 1) {
      filter.application_id = query.applicationIds[0];
    }
    if (query.publisherIds?.length === 1) {
      filter.publisher_id = query.publisherIds[0];
    }

    // Fetch
    let records = await this.reader.findRecords<QuestionnaireResponseRecord>(
      COLLECTIONS.QUESTIONNAIRE_RESPONSES,
      filter,
    );

    // Client-side multi-value filter (Nillion filters only support single
    // value equality, so multi-value IN-style filters are applied here).
    if (query.applicationIds && query.applicationIds.length > 1) {
      const ids = new Set(query.applicationIds);
      records = records.filter((r) => ids.has(r.application_id));
    }
    if (query.publisherIds && query.publisherIds.length > 1) {
      const ids = new Set(query.publisherIds);
      records = records.filter((r) => ids.has(r.publisher_id));
    }

    // Aggregate
    const { buckets, groups, totalCount } = aggregateBucketedCounts({
      records,
      timestampField: "submitted_at",
      groupField: groupBy,
      bucket,
      from,
      to,
    });

    return {
      label: "Questionnaire responses",
      range: { from: from.toISOString(), to: to.toISOString() },
      bucket,
      groupBy,
      totalCount,
      groups,
      buckets,
    };
  }

  // -----------------------------------------------------------------------
  // Binary file uploads
  // -----------------------------------------------------------------------

  async binaryUploads(
    query: BinaryUploadStatsQuery = {},
  ): Promise<CollectionStatsResult> {
    const { from, to } = resolveRange(query.range);
    const bucket: TimeBucket = query.bucket ?? "day";
    const groupBy = query.groupBy ?? "uploader_did";

    const filter: NillionFilter = {
      uploaded_at: { $gte: from.toISOString(), $lt: to.toISOString() },
    };

    if (query.uploaderDids?.length === 1) {
      filter.uploader_did = query.uploaderDids[0];
    }
    if (query.contentTypes?.length === 1) {
      filter.content_type = query.contentTypes[0];
    }

    let records = await this.reader.findRecords<BinaryFileRecord>(
      COLLECTIONS.BINARY_FILES,
      filter,
    );

    if (query.uploaderDids && query.uploaderDids.length > 1) {
      const dids = new Set(query.uploaderDids);
      records = records.filter((r) => dids.has(r.uploader_did));
    }
    if (query.contentTypes && query.contentTypes.length > 1) {
      const types = new Set(query.contentTypes);
      records = records.filter((r) => types.has(r.content_type));
    }

    const { buckets, groups, totalCount } = aggregateBucketedCounts({
      records,
      timestampField: "uploaded_at",
      groupField: groupBy,
      bucket,
      from,
      to,
    });

    return {
      label: "Binary file uploads",
      range: { from: from.toISOString(), to: to.toISOString() },
      bucket,
      groupBy,
      totalCount,
      groups,
      buckets,
    };
  }
}
