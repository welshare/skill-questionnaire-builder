import {
  CollectionStats,
  type NillionCollectionReader,
  type CollectionStatsResult,
  type BinaryUploadStatsQuery,
  type TimeBucket,
} from "@welshare/sdk";
import { formatStatsTable } from "../format";

export interface UploadStatsArgs {
  from?: string;
  to?: string;
  bucket?: string;
  groupBy?: string;
  uploaderDids?: string[];
  contentTypes?: string[];
  json?: boolean;
}

function parseArgs(args: UploadStatsArgs): BinaryUploadStatsQuery {
  const query: BinaryUploadStatsQuery = {};

  if (args.from || args.to) {
    const to = args.to ? new Date(args.to) : new Date();
    const from = args.from
      ? new Date(args.from)
      : new Date(to.getTime() - 24 * 60 * 60 * 1000);
    query.range = { from, to };
  }

  if (args.bucket) {
    const valid: TimeBucket[] = ["hour", "day", "week"];
    if (!valid.includes(args.bucket as TimeBucket)) {
      throw new Error(`Invalid bucket "${args.bucket}". Must be one of: ${valid.join(", ")}`);
    }
    query.bucket = args.bucket as TimeBucket;
  }

  if (args.groupBy) {
    const valid = ["uploader_did", "application_id"] as const;
    if (!valid.includes(args.groupBy as typeof valid[number])) {
      throw new Error(`Invalid groupBy "${args.groupBy}". Must be one of: ${valid.join(", ")}`);
    }
    query.groupBy = args.groupBy as typeof valid[number];
  }

  if (args.uploaderDids?.length) query.uploaderDids = args.uploaderDids;
  if (args.contentTypes?.length) query.contentTypes = args.contentTypes;

  return query;
}

export async function runUploadStats(
  reader: NillionCollectionReader,
  args: UploadStatsArgs,
): Promise<void> {
  const query = parseArgs(args);
  const stats = new CollectionStats(reader);
  const result: CollectionStatsResult = await stats.binaryUploads(query);

  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } else {
    process.stdout.write(formatStatsTable(result));
  }
}
