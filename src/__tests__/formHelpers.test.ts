import { createMockAttribute, createMockFormContext } from "./mocks/xrm";
import {
  clearFormNotification,
  getAttributeValue,
  getLookupValue,
  getOptionSetText,
  setAttributeValue,
  setControlVisible,
  setLookupValue,
  setRequiredLevel,
  showFormNotification,
} from "../formHelpers";

describe("getAttributeValue / setAttributeValue", () => {
  it("returns null when the attribute doesn't exist on the form", () => {
    const formContext = createMockFormContext();
    expect(getAttributeValue(formContext, "missing")).toBeNull();
  });

  it("returns the attribute's value when present", () => {
    const formContext = createMockFormContext({
      revenue: createMockAttribute(50000),
    });
    expect(getAttributeValue(formContext, "revenue")).toBe(50000);
  });

  it("is a no-op when the attribute is missing", () => {
    const formContext = createMockFormContext();
    expect(() => setAttributeValue(formContext, "missing", "x")).not.toThrow();
  });

  it("calls setValue when the attribute is present", () => {
    const attr = createMockAttribute(null);
    const formContext = createMockFormContext({ name: attr });
    setAttributeValue(formContext, "name", "Contoso");
    expect(attr.setValue).toHaveBeenCalledWith("Contoso");
  });
});

describe("getLookupValue / setLookupValue", () => {
  it("returns null when the lookup is empty", () => {
    const formContext = createMockFormContext({
      parentaccountid: createMockAttribute(null),
    });
    expect(getLookupValue(formContext, "parentaccountid")).toBeNull();
  });

  it("returns a normalized EntityReference when the lookup is set", () => {
    const formContext = createMockFormContext({
      parentaccountid: createMockAttribute([
        { id: "guid-1", entityType: "account", name: "Contoso" },
      ]),
    });
    expect(getLookupValue(formContext, "parentaccountid")).toEqual({
      id: "guid-1",
      entityType: "account",
      name: "Contoso",
    });
  });

  it("clears the field when passed null", () => {
    const attr = createMockAttribute(null);
    const formContext = createMockFormContext({ parentaccountid: attr });
    setLookupValue(formContext, "parentaccountid", null);
    expect(attr.setValue).toHaveBeenCalledWith(null);
  });

  it("sets the field from an EntityReference", () => {
    const attr = createMockAttribute(null);
    const formContext = createMockFormContext({ parentaccountid: attr });
    setLookupValue(formContext, "parentaccountid", {
      id: "guid-1",
      entityType: "account",
      name: "Contoso",
    });
    expect(attr.setValue).toHaveBeenCalledWith([
      { id: "guid-1", entityType: "account", name: "Contoso" },
    ]);
  });
});

describe("setControlVisible", () => {
  it("is a no-op when the control doesn't exist on the form", () => {
    const formContext = createMockFormContext();
    expect(() => setControlVisible(formContext, "missing", true)).not.toThrow();
  });

  it("calls setVisible when the control exists", () => {
    const setVisible = jest.fn();
    const formContext = createMockFormContext({}, { revenue: { setVisible } });
    setControlVisible(formContext, "revenue", false);
    expect(setVisible).toHaveBeenCalledWith(false);
  });
});

describe("setRequiredLevel", () => {
  it("calls setRequiredLevel on the attribute when present", () => {
    const attr = createMockAttribute(null);
    const formContext = createMockFormContext({ name: attr });
    setRequiredLevel(formContext, "name", "required");
    expect(attr.setRequiredLevel).toHaveBeenCalledWith("required");
  });

  it("is a no-op when the attribute is missing", () => {
    const formContext = createMockFormContext();
    expect(() =>
      setRequiredLevel(formContext, "missing", "required")
    ).not.toThrow();
  });
});

describe("getOptionSetText", () => {
  it("returns the option's display text", () => {
    const formContext = createMockFormContext({
      statuscode: createMockAttribute(1, "Active"),
    });
    expect(getOptionSetText(formContext, "statuscode")).toBe("Active");
  });

  it("returns null when the attribute is missing", () => {
    const formContext = createMockFormContext();
    expect(getOptionSetText(formContext, "missing")).toBeNull();
  });
});

describe("form notifications", () => {
  it("showFormNotification delegates to formContext.ui.setFormNotification", () => {
    const formContext = createMockFormContext();
    showFormNotification(formContext, "Saved", "INFO", "save-ok");
    expect(formContext.ui.setFormNotification).toHaveBeenCalledWith(
      "Saved",
      "INFO",
      "save-ok"
    );
  });

  it("clearFormNotification delegates to formContext.ui.clearFormNotification", () => {
    const formContext = createMockFormContext();
    clearFormNotification(formContext, "save-ok");
    expect(formContext.ui.clearFormNotification).toHaveBeenCalledWith(
      "save-ok"
    );
  });
});
