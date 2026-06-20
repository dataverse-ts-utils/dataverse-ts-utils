/// <reference types="xrm" />

import { EntityReference } from "./types";

/** Safely gets an attribute value, returning null instead of throwing if missing. */
export function getAttributeValue<T = unknown>(
  formContext: Xrm.FormContext,
  attributeName: string
): T | null {
  const attr = formContext.getAttribute(attributeName);
  return attr ? (attr.getValue() as T) : null;
}

/**
 * Safely sets an attribute value if the attribute exists on the form.
 * Accepts `unknown` for caller convenience (e.g. values coming from JSON,
 * form data, or other dynamic sources) and casts internally - the SDK's
 * setValue() itself does no runtime validation on the value's shape either.
 */
export function setAttributeValue(
  formContext: Xrm.FormContext,
  attributeName: string,
  value: unknown
): void {
  const attr = formContext.getAttribute(attributeName);
  if (attr) {
    attr.setValue(value as Xrm.Attributes.AttributeValues | null);
  }
}

/** Gets the first lookup value for a lookup field as a normalized EntityReference. */
export function getLookupValue(
  formContext: Xrm.FormContext,
  attributeName: string
): EntityReference | null {
  const attr = formContext.getAttribute<Xrm.Attributes.LookupAttribute>(
    attributeName
  );
  const value = attr?.getValue();
  if (!value || value.length === 0) return null;
  const ref = value[0];
  return { id: ref.id, entityType: ref.entityType, name: ref.name };
}

/** Sets a lookup field from id/entityType/name. */
export function setLookupValue(
  formContext: Xrm.FormContext,
  attributeName: string,
  ref: EntityReference | null
): void {
  const attr = formContext.getAttribute<Xrm.Attributes.LookupAttribute>(
    attributeName
  );
  if (!attr) return;
  attr.setValue(
    ref ? [{ id: ref.id, entityType: ref.entityType, name: ref.name }] : null
  );
}

/** Shows or hides a control by name, no-op if the control doesn't exist on the form. */
export function setControlVisible(
  formContext: Xrm.FormContext,
  controlName: string,
  visible: boolean
): void {
  const control = formContext.getControl(controlName) as
    | Xrm.Controls.StandardControl
    | null;
  if (control) {
    control.setVisible(visible);
  }
}

/** Sets the required level for a field ("none" | "required" | "recommended"). */
export function setRequiredLevel(
  formContext: Xrm.FormContext,
  attributeName: string,
  level: "none" | "required" | "recommended"
): void {
  const attr = formContext.getAttribute(attributeName);
  if (attr) {
    attr.setRequiredLevel(level);
  }
}

/** Returns the selected option's text for an OptionSet attribute, if any. */
export function getOptionSetText(
  formContext: Xrm.FormContext,
  attributeName: string
): string | null {
  const attr = formContext.getAttribute<Xrm.Attributes.OptionSetAttribute>(
    attributeName
  );
  return attr?.getText() ?? null;
}

/** Displays a non-blocking form notification, deduped by a unique id. */
export function showFormNotification(
  formContext: Xrm.FormContext,
  message: string,
  level: "ERROR" | "WARNING" | "INFO",
  uniqueId: string
): void {
  formContext.ui.setFormNotification(message, level, uniqueId);
}

/** Clears a previously set form notification by its unique id. */
export function clearFormNotification(
  formContext: Xrm.FormContext,
  uniqueId: string
): void {
  formContext.ui.clearFormNotification(uniqueId);
}
