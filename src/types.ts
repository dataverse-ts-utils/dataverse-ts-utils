/**
 * Shared Dataverse types used across the toolkit.
 * These mirror common Web API / form-context shapes so consumers
 * don't need to redefine them in every project.
 */

export interface EntityReference {
  id: string;
  entityType: string;
  name?: string;
}

export interface OptionSetValue {
  value: number;
  text?: string;
}

/**
 * Error thrown by this package's Web API wrappers.
 *
 * This is a real `Error` subclass - NOT a plain object - specifically so
 * that `instanceof Error` checks (and test matchers like Jest's
 * `.toThrow()`, which only recognizes actual Error instances) work the way
 * any normal JS error-handling code expects.
 */
export class WebApiError extends Error {
  errorCode?: number;
  raw?: unknown;

  constructor(message: string, errorCode?: number, raw?: unknown) {
    super(message);
    this.name = "WebApiError";
    this.errorCode = errorCode;
    this.raw = raw;
    // Without this, instanceof checks can break under some compilation
    // targets (notably ES5) due to how TS down-levels class extension of
    // built-ins like Error.
    Object.setPrototypeOf(this, WebApiError.prototype);
  }
}

/**
 * Shape of Xrm.WebApi.retrieveMultipleRecords()'s resolved value.
 * Note this is the CLIENT-SIDE SDK shape, not the raw OData wire format -
 * it uses `entities` and `nextLink`, not `value` and `@odata.nextLink`.
 */
export interface RetrieveMultipleResponse<T = Record<string, unknown>> {
  entities: T[];
  entityName?: string;
  nextLink?: string;
}

/** Strips the GUID braces/casing Dataverse sometimes returns inconsistently. */
export type Guid = string;
