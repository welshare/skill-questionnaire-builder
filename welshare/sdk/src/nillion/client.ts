import type { NillionRecord } from "../types/records";

/**
 * Minimal filter predicate that can be sent to a Nillion collection query.
 *
 * Keys are field names, values are either exact-match scalars or operator
 * objects like `{ $gte: "2025-01-01T00:00:00Z" }`.
 */
export type NillionFilter = Record<
  string,
  string | number | boolean | { $gte?: string; $lte?: string; $lt?: string; $gt?: string }
>;

/**
 * Abstract interface for reading records from a Nillion SecretVault
 * collection.
 *
 * Consumers provide a concrete implementation that talks to the actual
 * Nillion network (or a local mock for testing).  The SDK aggregation
 * layer only depends on this interface so it stays transport-agnostic.
 */
export interface NillionCollectionReader {
  /**
   * Return all records from `collectionName` that match `filter`.
   *
   * Implementations should handle pagination internally and return the
   * full result set.
   */
  findRecords<T extends NillionRecord>(
    collectionName: string,
    filter?: NillionFilter,
  ): Promise<T[]>;
}

// ---------------------------------------------------------------------------
// Well-known collection names
// ---------------------------------------------------------------------------

export const COLLECTIONS = {
  QUESTIONNAIRE_RESPONSES: "questionnaire_responses",
  BINARY_FILES: "binary_files",
} as const;

// ---------------------------------------------------------------------------
// Simple in-memory stub (useful for tests & CLI dry-runs)
// ---------------------------------------------------------------------------

/**
 * In-memory implementation of {@link NillionCollectionReader}.
 *
 * Feed it records via {@link seed} and use it anywhere the SDK expects a
 * reader.  Supports the subset of filter operators used by the stats
 * queries ($gte, $lt).
 */
export class InMemoryCollectionReader implements NillionCollectionReader {
  private store = new Map<string, NillionRecord[]>();

  /** Insert records for a given collection. */
  seed<T extends NillionRecord>(collectionName: string, records: T[]): void {
    const existing = this.store.get(collectionName) ?? [];
    this.store.set(collectionName, [...existing, ...records]);
  }

  async findRecords<T extends NillionRecord>(
    collectionName: string,
    filter?: NillionFilter,
  ): Promise<T[]> {
    const all = (this.store.get(collectionName) ?? []) as T[];
    if (!filter) return all;

    return all.filter((record) => {
      for (const [key, condition] of Object.entries(filter)) {
        const value = (record as Record<string, unknown>)[key];
        if (typeof condition === "object" && condition !== null) {
          if (condition.$gte !== undefined && (value as string) < condition.$gte) return false;
          if (condition.$gt !== undefined && (value as string) <= condition.$gt) return false;
          if (condition.$lte !== undefined && (value as string) > condition.$lte) return false;
          if (condition.$lt !== undefined && (value as string) >= condition.$lt) return false;
        } else {
          if (value !== condition) return false;
        }
      }
      return true;
    });
  }
}
