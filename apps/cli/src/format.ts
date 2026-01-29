import type { CollectionStatsResult, BucketedCount } from "@welshare/sdk";

/**
 * Render a {@link CollectionStatsResult} as a human-readable table.
 *
 * Output looks like:
 *
 * ```
 * Questionnaire responses
 * Range : 2025-06-01T00:00:00.000Z → 2025-06-08T00:00:00.000Z
 * Bucket: day   Group by: publisher_id   Total: 128
 *
 * bucket_start              | my-publisher | other-pub
 * --------------------------+--------------+----------
 * 2025-06-01T00:00:00.000Z |           12 |         3
 * 2025-06-02T00:00:00.000Z |            8 |         7
 * ```
 */
export function formatStatsTable(result: CollectionStatsResult): string {
  const lines: string[] = [];

  // Header
  lines.push(result.label);
  lines.push(`Range : ${result.range.from} → ${result.range.to}`);
  lines.push(
    `Bucket: ${result.bucket}   Group by: ${result.groupBy}   Total: ${result.totalCount}`,
  );
  lines.push("");

  if (result.buckets.length === 0) {
    lines.push("(no data)");
    lines.push("");
    return lines.join("\n");
  }

  // Build a row-per-bucket, column-per-group matrix
  const groups = result.groups;

  // Determine column widths
  const tsLabel = "bucket_start";
  const tsWidth = Math.max(
    tsLabel.length,
    ...result.buckets.map((b) => b.bucketStart.length),
  );
  const colWidths = groups.map((g) =>
    Math.max(g.length, ...countsByGroup(result.buckets, g).map((n) => String(n).length)),
  );

  // Header row
  const headerCells = [tsLabel.padEnd(tsWidth), ...groups.map((g, i) => g.padStart(colWidths[i]))];
  lines.push(headerCells.join(" | "));

  // Separator
  const sepCells = ["-".repeat(tsWidth), ...colWidths.map((w) => "-".repeat(w))];
  lines.push(sepCells.join("-+-"));

  // Data rows — one per unique bucketStart
  const seen = new Set<string>();
  for (const b of result.buckets) {
    if (seen.has(b.bucketStart)) continue;
    seen.add(b.bucketStart);

    const dataCells = [
      b.bucketStart.padEnd(tsWidth),
      ...groups.map((g, i) => {
        const count = result.buckets.find(
          (x) => x.bucketStart === b.bucketStart && x.group === g,
        )?.count ?? 0;
        return String(count).padStart(colWidths[i]);
      }),
    ];
    lines.push(dataCells.join(" | "));
  }

  lines.push("");
  return lines.join("\n");
}

function countsByGroup(buckets: BucketedCount[], group: string): number[] {
  return buckets.filter((b) => b.group === group).map((b) => b.count);
}
