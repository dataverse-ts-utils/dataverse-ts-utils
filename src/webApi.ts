/// <reference types="xrm" />

import { RetrieveMultipleResponse, WebApiError } from "./types";

function getXrm(): Xrm.XrmStatic {
  if (typeof Xrm === "undefined") {
    throw new Error(
      "Xrm global is not available. These helpers must run inside a Dataverse form, ribbon, or PCF context with client API access."
    );
  }
  return Xrm;
}

function normalizeError(error: unknown): WebApiError {
  if (error instanceof WebApiError) return error;
  const err = error as { message?: string; errorCode?: number };
  return new WebApiError(
    err?.message ?? "Unknown Dataverse Web API error",
    err?.errorCode,
    error
  );
}

/** Retrieve a single record with an OData $select / $expand options string. */
export async function retrieveRecord<T = Record<string, unknown>>(
  entityLogicalName: string,
  id: string,
  options?: string
): Promise<T> {
  try {
    return (await getXrm().WebApi.retrieveRecord(
      entityLogicalName,
      id,
      options
    )) as T;
  } catch (error) {
    throw normalizeError(error);
  }
}

/** Retrieve multiple records using an OData query string (e.g. "?$select=name&$filter=..."). */
export async function retrieveMultipleRecords<T = Record<string, unknown>>(
  entityLogicalName: string,
  options?: string,
  maxPageSize?: number
): Promise<RetrieveMultipleResponse<T>> {
  try {
    const response = await getXrm().WebApi.retrieveMultipleRecords(
      entityLogicalName,
      options,
      maxPageSize
    );
    return response as unknown as RetrieveMultipleResponse<T>;
  } catch (error) {
    throw normalizeError(error);
  }
}

/** Retrieve ALL pages for a query, following the SDK's `nextLink` automatically. */
export async function retrieveAllPages<T = Record<string, unknown>>(
  entityLogicalName: string,
  options?: string
): Promise<T[]> {
  const results: T[] = [];
  let response = await retrieveMultipleRecords<T>(entityLogicalName, options);
  results.push(...response.entities);

  while (response.nextLink) {
    const nextOptions = response.nextLink.split("?")[1];
    response = await retrieveMultipleRecords<T>(
      entityLogicalName,
      `?${nextOptions}`
    );
    results.push(...response.entities);
  }

  return results;
}

/** Create a record and return its new GUID. */
export async function createRecord(
  entityLogicalName: string,
  data: Record<string, unknown>
): Promise<string> {
  try {
    const result = await getXrm().WebApi.createRecord(
      entityLogicalName,
      data
    );
    return result.id;
  } catch (error) {
    throw normalizeError(error);
  }
}

/** Update an existing record. */
export async function updateRecord(
  entityLogicalName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await getXrm().WebApi.updateRecord(entityLogicalName, id, data);
  } catch (error) {
    throw normalizeError(error);
  }
}

/** Delete a record. */
export async function deleteRecord(
  entityLogicalName: string,
  id: string
): Promise<void> {
  try {
    await getXrm().WebApi.deleteRecord(entityLogicalName, id);
  } catch (error) {
    throw normalizeError(error);
  }
}

/** Execute a FetchXML query and return the parsed result set. */
export async function executeFetchXml<T = Record<string, unknown>>(
  entityLogicalName: string,
  fetchXml: string
): Promise<T[]> {
  try {
    const encoded = `?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await getXrm().WebApi.retrieveMultipleRecords(
      entityLogicalName,
      encoded
    );
    return response.entities as T[];
  } catch (error) {
    throw normalizeError(error);
  }
}
