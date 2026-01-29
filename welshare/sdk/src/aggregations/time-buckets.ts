import type { TimeBucket } from "../types/aggregation";

/**
 * Return a normalised Date regardless of whether the input is already a
 * Date or an ISO-8601 string.
 */
export function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value;
}

/**
 * Floor a date down to the start of the given bucket.
 *
 * - **hour** → top of the hour  (e.g. 14:37 → 14:00)
 * - **day**  → midnight UTC      (e.g. 14:37 → 00:00)
 * - **week** → Monday 00:00 UTC  (ISO week start)
 */
export function floorToBucket(date: Date, bucket: TimeBucket): Date {
  const d = new Date(date.getTime());

  switch (bucket) {
    case "hour":
      d.setUTCMinutes(0, 0, 0);
      return d;

    case "day":
      d.setUTCHours(0, 0, 0, 0);
      return d;

    case "week": {
      d.setUTCHours(0, 0, 0, 0);
      // getUTCDay(): 0 = Sunday … 6 = Saturday.  ISO week starts on Monday.
      const dayOfWeek = d.getUTCDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // days since Monday
      d.setUTCDate(d.getUTCDate() - diff);
      return d;
    }
  }
}

/**
 * Advance a date by exactly one bucket step.
 */
export function advanceBucket(date: Date, bucket: TimeBucket): Date {
  const d = new Date(date.getTime());

  switch (bucket) {
    case "hour":
      d.setUTCHours(d.getUTCHours() + 1);
      return d;
    case "day":
      d.setUTCDate(d.getUTCDate() + 1);
      return d;
    case "week":
      d.setUTCDate(d.getUTCDate() + 7);
      return d;
  }
}

/**
 * Generate all bucket boundaries between `from` (inclusive) and `to`
 * (exclusive).
 *
 * Returns an array of `[bucketStart, bucketEnd)` pairs as ISO strings.
 */
export function generateBucketRanges(
  from: Date,
  to: Date,
  bucket: TimeBucket,
): Array<{ start: string; end: string }> {
  const ranges: Array<{ start: string; end: string }> = [];
  let cursor = floorToBucket(from, bucket);

  while (cursor < to) {
    const next = advanceBucket(cursor, bucket);
    ranges.push({
      start: cursor.toISOString(),
      end: next.toISOString(),
    });
    cursor = next;
  }

  return ranges;
}

/**
 * Return the bucket key (ISO string of the bucket start) for a given
 * timestamp.
 */
export function bucketKey(timestamp: string | Date, bucket: TimeBucket): string {
  return floorToBucket(toDate(timestamp), bucket).toISOString();
}
