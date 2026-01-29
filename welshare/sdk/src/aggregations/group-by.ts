import type { NillionRecord } from "../types/records";
import type { TimeBucket, BucketedCount } from "../types/aggregation";
import { bucketKey, generateBucketRanges, toDate } from "./time-buckets";

/**
 * Composite key used internally for the (bucket, group) tuple.
 */
function compositeKey(bucket: string, group: string): string {
  return `${bucket}||${group}`;
}

export interface AggregateInput<T extends NillionRecord> {
  records: T[];
  /** Field on T that holds the ISO-8601 timestamp to bucket on. */
  timestampField: keyof T & string;
  /** Field on T to group by (e.g. "publisher_id"). */
  groupField: keyof T & string;
  /** Bucket granularity. */
  bucket: TimeBucket;
  /** Overall query range — used to materialise empty buckets. */
  from: Date;
  to: Date;
}

/**
 * Client-side bucketed + grouped count aggregation.
 *
 * Because Nillion collections expose no server-side aggregation
 * primitives, we pull the (already-filtered) record set and compute
 * counts locally.
 *
 * The function materialises *all* (bucket × group) combinations inside
 * the requested range so consumers always get a dense result set with
 * explicit zero-counts.
 */
export function aggregateBucketedCounts<T extends NillionRecord>(
  input: AggregateInput<T>,
): { buckets: BucketedCount[]; groups: string[]; totalCount: number } {
  const { records, timestampField, groupField, bucket, from, to } = input;

  // --- 1. Discover all distinct groups -----------------------------------
  const groupSet = new Set<string>();
  for (const r of records) {
    groupSet.add(String(r[groupField] ?? "unknown"));
  }
  const groups = [...groupSet].sort();

  // --- 2. Build the dense bucket × group skeleton ------------------------
  const bucketRanges = generateBucketRanges(from, to, bucket);
  const counts = new Map<string, number>();

  for (const range of bucketRanges) {
    for (const g of groups) {
      counts.set(compositeKey(range.start, g), 0);
    }
  }

  // --- 3. Count records into the correct cell ----------------------------
  let totalCount = 0;
  for (const r of records) {
    const ts = r[timestampField] as unknown;
    if (typeof ts !== "string") continue;

    const d = toDate(ts);
    if (d < from || d >= to) continue;

    const bk = bucketKey(ts, bucket);
    const gk = String(r[groupField] ?? "unknown");

    // Ensure the group exists even if it wasn't in the initial set
    if (!groupSet.has(gk)) {
      groupSet.add(gk);
      groups.push(gk);
      groups.sort();
      // back-fill empty buckets for the newly discovered group
      for (const range of bucketRanges) {
        counts.set(compositeKey(range.start, gk), 0);
      }
    }

    const key = compositeKey(bk, gk);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    totalCount++;
  }

  // --- 4. Flatten into BucketedCount[] -----------------------------------
  const buckets: BucketedCount[] = [];
  for (const range of bucketRanges) {
    for (const g of groups) {
      buckets.push({
        bucketStart: range.start,
        bucketEnd: range.end,
        group: g,
        count: counts.get(compositeKey(range.start, g)) ?? 0,
      });
    }
  }

  return { buckets, groups, totalCount };
}
