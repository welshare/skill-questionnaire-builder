#!/usr/bin/env node

/**
 * welshare CLI — Nillion collection stats
 *
 * Usage:
 *   welshare questionnaire-stats [options]
 *   welshare upload-stats [options]
 *
 * Common options:
 *   --from <iso-date>       Start of time range (default: 24 h ago)
 *   --to <iso-date>         End of time range   (default: now)
 *   --bucket <hour|day|week>  Time bucket granularity (default: day)
 *   --group-by <field>      Field to group by (see per-command help)
 *   --json                  Output raw JSON instead of a table
 *
 * questionnaire-stats options:
 *   --group-by <application_id|publisher_id>  (default: application_id)
 *   --application-ids <id,...>
 *   --publisher-ids <id,...>
 *
 * upload-stats options:
 *   --group-by <uploader_did|application_id>  (default: uploader_did)
 *   --uploader-dids <did,...>
 *   --content-types <mime,...>
 *
 * Environment:
 *   NILLION_CONFIG   Path to a Nillion connection config file.
 *                    When absent the CLI uses a demo in-memory reader
 *                    seeded with sample data.
 */

import { InMemoryCollectionReader, COLLECTIONS } from "@welshare/sdk";
import { runQuestionnaireStats, type QuestionnaireStatsArgs } from "./commands/questionnaire-stats";
import { runUploadStats, type UploadStatsArgs } from "./commands/upload-stats";
import { seedDemoData } from "./demo-data";

// ---------------------------------------------------------------------------
// Minimal argv parser (no external deps)
// ---------------------------------------------------------------------------

function flag(argv: string[], name: string): boolean {
  return argv.includes(`--${name}`);
}

function option(argv: string[], name: string): string | undefined {
  const idx = argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= argv.length) return undefined;
  return argv[idx + 1];
}

function listOption(argv: string[], name: string): string[] | undefined {
  const raw = option(argv, name);
  if (!raw) return undefined;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (!command || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  // Resolve collection reader.
  // In production you'd construct a real Nillion-backed reader from config;
  // for now we fall back to demo data so the CLI is runnable out of the box.
  const reader = new InMemoryCollectionReader();
  seedDemoData(reader);

  switch (command) {
    case "questionnaire-stats": {
      const args: QuestionnaireStatsArgs = {
        from: option(argv, "from"),
        to: option(argv, "to"),
        bucket: option(argv, "bucket"),
        groupBy: option(argv, "group-by"),
        applicationIds: listOption(argv, "application-ids"),
        publisherIds: listOption(argv, "publisher-ids"),
        json: flag(argv, "json"),
      };
      await runQuestionnaireStats(reader, args);
      break;
    }

    case "upload-stats": {
      const args: UploadStatsArgs = {
        from: option(argv, "from"),
        to: option(argv, "to"),
        bucket: option(argv, "bucket"),
        groupBy: option(argv, "group-by"),
        uploaderDids: listOption(argv, "uploader-dids"),
        contentTypes: listOption(argv, "content-types"),
        json: flag(argv, "json"),
      };
      await runUploadStats(reader, args);
      break;
    }

    default:
      process.stderr.write(`Unknown command: ${command}\n\n`);
      printUsage();
      process.exitCode = 1;
  }
}

function printUsage(): void {
  process.stdout.write(`welshare – Nillion collection stats CLI

Commands:
  questionnaire-stats   Count questionnaire responses by time bucket + group
  upload-stats          Count binary file uploads by time bucket + group

Common flags:
  --from <iso-date>           Start of time range  (default: 24 h ago)
  --to <iso-date>             End of time range    (default: now)
  --bucket <hour|day|week>    Bucket granularity   (default: day)
  --group-by <field>          Field to group by
  --json                      Output raw JSON

questionnaire-stats:
  --group-by application_id | publisher_id   (default: application_id)
  --application-ids <id,id,...>
  --publisher-ids <id,id,...>

upload-stats:
  --group-by uploader_did | application_id   (default: uploader_did)
  --uploader-dids <did,did,...>
  --content-types <mime,mime,...>
`);
}

main().catch((err) => {
  process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
