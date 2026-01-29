import {
  CollectionStats,
  type NillionCollectionReader,
  type CollectionStatsResult,
  type QuestionnaireResponseStatsQuery,
  type TimeBucket,
} from "@welshare/sdk";
import { formatStatsTable } from "../format";

export interface QuestionnaireStatsArgs {
  from?: string;
  to?: string;
  bucket?: string;
  groupBy?: string;
  applicationIds?: string[];
  publisherIds?: string[];
  json?: boolean;
}

function parseArgs(args: QuestionnaireStatsArgs): QuestionnaireResponseStatsQuery {
  const query: QuestionnaireResponseStatsQuery = {};

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
    const valid = ["application_id", "publisher_id"] as const;
    if (!valid.includes(args.groupBy as typeof valid[number])) {
      throw new Error(`Invalid groupBy "${args.groupBy}". Must be one of: ${valid.join(", ")}`);
    }
    query.groupBy = args.groupBy as typeof valid[number];
  }

  if (args.applicationIds?.length) query.applicationIds = args.applicationIds;
  if (args.publisherIds?.length) query.publisherIds = args.publisherIds;

  return query;
}

export async function runQuestionnaireStats(
  reader: NillionCollectionReader,
  args: QuestionnaireStatsArgs,
): Promise<void> {
  const query = parseArgs(args);
  const stats = new CollectionStats(reader);
  const result: CollectionStatsResult = await stats.questionnaireResponses(query);

  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } else {
    process.stdout.write(formatStatsTable(result));
  }
}
