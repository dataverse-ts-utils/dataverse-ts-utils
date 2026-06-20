/**
 * Minimal Xrm mocks for unit testing without a real Dataverse environment.
 * These only implement the methods/properties this package's helpers touch -
 * they are NOT full Xrm.FormContext / Xrm.WebApi shims, so don't reuse them
 * as a general-purpose Xrm testing library.
 */

export interface MockAttribute {
  getValue: jest.Mock;
  setValue: jest.Mock;
  getText: jest.Mock;
  setRequiredLevel: jest.Mock;
}

/** Creates a fake attribute. Pass `text` to back getOptionSetText() calls. */
export function createMockAttribute(
  value: unknown,
  text: string | null = null
): MockAttribute {
  return {
    getValue: jest.fn(() => value),
    setValue: jest.fn(),
    getText: jest.fn(() => text),
    setRequiredLevel: jest.fn(),
  };
}

export interface MockControl {
  setVisible: jest.Mock;
}

/**
 * Creates a fake form context. Pass attributes/controls keyed by logical
 * name - anything not listed resolves to null, matching real Xrm behavior
 * for fields not present on the form.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockFormContext(
  attributes: Record<string, MockAttribute> = {},
  controls: Record<string, MockControl> = {}
): any {
  return {
    getAttribute: jest.fn((name: string) => attributes[name] ?? null),
    getControl: jest.fn((name: string) => controls[name] ?? null),
    ui: {
      setFormNotification: jest.fn(),
      clearFormNotification: jest.fn(),
    },
  };
}

export interface MockWebApiOverrides {
  retrieveRecord?: jest.Mock;
  retrieveMultipleRecords?: jest.Mock;
  createRecord?: jest.Mock;
  updateRecord?: jest.Mock;
  deleteRecord?: jest.Mock;
}

/** Installs a fake `global.Xrm.WebApi` for the duration of a test. */
export function installMockXrmWebApi(overrides: MockWebApiOverrides = {}) {
  const webApi = {
    retrieveRecord: jest.fn(),
    retrieveMultipleRecords: jest.fn(),
    createRecord: jest.fn(),
    updateRecord: jest.fn(),
    deleteRecord: jest.fn(),
    ...overrides,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).Xrm = { WebApi: webApi };
  return webApi;
}

/**
 * Removes the global Xrm mock - call in afterEach to avoid test bleed.
 * Reassigns to `undefined` rather than using `delete`: both satisfy
 * `typeof Xrm === "undefined"`, but `delete` on a global property isn't
 * guaranteed to succeed in every environment/sandbox, while a plain
 * assignment always does.
 */
export function uninstallMockXrm(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).Xrm = undefined;
}
