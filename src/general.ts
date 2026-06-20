import { EntityReference, Guid } from "./types";

/** Removes braces and lowercases a GUID for consistent comparisons. */
export function normalizeGuid(guid: string): Guid {
  return guid.replace(/[{}]/g, "").toLowerCase();
}

/** Quick check for a valid GUID string (braces optional). */
export function isGuid(value: string): boolean {
  return /^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}?$/.test(
    value
  );
}

/** Builds an EntityReference object from raw id/entityType/name. */
export function toEntityReference(
  entityType: string,
  id: string,
  name?: string
): EntityReference {
  return { entityType, id: normalizeGuid(id), name };
}

/**
 * Parses the bound-field string format Dataverse uses for lookups
 * in some contexts, e.g. "/accounts(00000000-0000-0000-0000-000000000000)".
 */
export function parseEntityReferenceUrl(url: string): EntityReference | null {
  const match = url.match(/\/(\w+)\(([0-9a-fA-F-]+)\)/);
  if (!match) return null;
  return { entityType: match[1], id: normalizeGuid(match[2]) };
}

/** Formats a Date as Dataverse-friendly ISO (date-only, no time) string. */
export function toDataverseDateOnly(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Safe JSON parse for attribute values that may already be objects. */
export function safeParse<T = unknown>(value: unknown): T | null {
  if (typeof value !== "string") return (value as T) ?? null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
