import { installMockXrmWebApi, uninstallMockXrm } from "./mocks/xrm";
import {
  createRecord,
  deleteRecord,
  executeFetchXml,
  retrieveAllPages,
  retrieveRecord,
  updateRecord,
} from "../webApi";

beforeEach(() => {
  uninstallMockXrm();
});

afterEach(() => {
  uninstallMockXrm();
});

describe("retrieveRecord", () => {
  it("throws a clear error when Xrm is not available", async () => {
    await expect(retrieveRecord("account", "guid-1")).rejects.toThrow(
      /Xrm global is not available/
    );
  });

  it("rejects with a real WebApiError (Error subclass), not a plain object", async () => {
    await expect(retrieveRecord("account", "guid-1")).rejects.toBeInstanceOf(
      Error
    );
  });

  it("passes args through to Xrm.WebApi.retrieveRecord and returns the result", async () => {
    const webApi = installMockXrmWebApi({
      retrieveRecord: jest.fn().mockResolvedValue({ name: "Contoso" }),
    });

    const result = await retrieveRecord("account", "guid-1", "?$select=name");

    expect(webApi.retrieveRecord).toHaveBeenCalledWith(
      "account",
      "guid-1",
      "?$select=name"
    );
    expect(result).toEqual({ name: "Contoso" });
  });

  it("throws a normalized error when the Web API call rejects", async () => {
    installMockXrmWebApi({
      retrieveRecord: jest
        .fn()
        .mockRejectedValue({ message: "Not found", errorCode: 404 }),
    });

    await expect(
      retrieveRecord("account", "missing-guid")
    ).rejects.toMatchObject({ message: "Not found", errorCode: 404 });
  });
});

describe("createRecord / updateRecord / deleteRecord", () => {
  it("createRecord returns the new record id", async () => {
    const webApi = installMockXrmWebApi({
      createRecord: jest.fn().mockResolvedValue({ id: "new-guid" }),
    });

    const id = await createRecord("account", { name: "Contoso" });

    expect(webApi.createRecord).toHaveBeenCalledWith("account", {
      name: "Contoso",
    });
    expect(id).toBe("new-guid");
  });

  it("updateRecord calls through with id and payload", async () => {
    const webApi = installMockXrmWebApi({
      updateRecord: jest.fn().mockResolvedValue(undefined),
    });

    await updateRecord("account", "guid-1", { name: "Updated" });

    expect(webApi.updateRecord).toHaveBeenCalledWith("account", "guid-1", {
      name: "Updated",
    });
  });

  it("deleteRecord calls through with entity and id", async () => {
    const webApi = installMockXrmWebApi({
      deleteRecord: jest.fn().mockResolvedValue(undefined),
    });

    await deleteRecord("account", "guid-1");

    expect(webApi.deleteRecord).toHaveBeenCalledWith("account", "guid-1");
  });
});

describe("retrieveAllPages", () => {
  it("follows nextLink until exhausted and concatenates results", async () => {
    const retrieveMultipleRecords = jest
      .fn()
      .mockResolvedValueOnce({
        entities: [{ id: 1 }, { id: 2 }],
        nextLink:
          "https://org.crm.dynamics.com/api/data/v9.2/accounts?$skiptoken=abc",
      })
      .mockResolvedValueOnce({ entities: [{ id: 3 }] });

    installMockXrmWebApi({ retrieveMultipleRecords });

    const results = await retrieveAllPages("account", "?$select=name");

    expect(results).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(retrieveMultipleRecords).toHaveBeenCalledTimes(2);
    expect(retrieveMultipleRecords).toHaveBeenNthCalledWith(
      2,
      "account",
      "?$skiptoken=abc",
      undefined // retrieveMultipleRecords always forwards maxPageSize, even when not provided
    );
  });

  it("returns a single page's results when there's no nextLink", async () => {
    const retrieveMultipleRecords = jest
      .fn()
      .mockResolvedValue({ entities: [{ id: 1 }] });

    installMockXrmWebApi({ retrieveMultipleRecords });

    const results = await retrieveAllPages("account");

    expect(results).toEqual([{ id: 1 }]);
    expect(retrieveMultipleRecords).toHaveBeenCalledTimes(1);
  });
});

describe("executeFetchXml", () => {
  it("URL-encodes the fetchXml and returns the entities array", async () => {
    const retrieveMultipleRecords = jest.fn().mockResolvedValue({
      entities: [{ name: "Contoso" }],
    });

    installMockXrmWebApi({ retrieveMultipleRecords });

    const result = await executeFetchXml(
      "account",
      "<fetch><entity name='account' /></fetch>"
    );

    expect(retrieveMultipleRecords).toHaveBeenCalledWith(
      "account",
      expect.stringContaining("?fetchXml=")
    );
    expect(result).toEqual([{ name: "Contoso" }]);
  });

  it("throws a normalized error when the query fails", async () => {
    installMockXrmWebApi({
      retrieveMultipleRecords: jest
        .fn()
        .mockRejectedValue({ message: "Invalid fetch", errorCode: 400 }),
    });

    await expect(
      executeFetchXml("account", "<fetch></fetch>")
    ).rejects.toMatchObject({ message: "Invalid fetch", errorCode: 400 });
  });
});
