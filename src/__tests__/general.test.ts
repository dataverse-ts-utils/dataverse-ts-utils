import {
  isGuid,
  normalizeGuid,
  parseEntityReferenceUrl,
  safeParse,
  toDataverseDateOnly,
  toEntityReference,
} from "../general";

describe("normalizeGuid", () => {
  it("strips braces and lowercases", () => {
    expect(normalizeGuid("{ABCD1234-AB12-AB12-AB12-ABCDEF123456}")).toBe(
      "abcd1234-ab12-ab12-ab12-abcdef123456"
    );
  });

  it("leaves an already-normalized guid unchanged", () => {
    const guid = "abcd1234-ab12-ab12-ab12-abcdef123456";
    expect(normalizeGuid(guid)).toBe(guid);
  });
});

describe("isGuid", () => {
  it("accepts a valid guid with braces", () => {
    expect(isGuid("{abcd1234-ab12-ab12-ab12-abcdef123456}")).toBe(true);
  });

  it("accepts a valid guid without braces", () => {
    expect(isGuid("abcd1234-ab12-ab12-ab12-abcdef123456")).toBe(true);
  });

  it("rejects a non-guid string", () => {
    expect(isGuid("not-a-guid")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isGuid("")).toBe(false);
  });
});

describe("toEntityReference", () => {
  it("builds a normalized entity reference with a name", () => {
    expect(
      toEntityReference(
        "account",
        "{ABCD1234-AB12-AB12-AB12-ABCDEF123456}",
        "Contoso"
      )
    ).toEqual({
      entityType: "account",
      id: "abcd1234-ab12-ab12-ab12-abcdef123456",
      name: "Contoso",
    });
  });

  it("omits name when not provided", () => {
    const ref = toEntityReference("account", "abcd1234-ab12-ab12-ab12-abcdef123456");
    expect(ref.name).toBeUndefined();
  });
});

describe("parseEntityReferenceUrl", () => {
  it("parses a valid bound-field url", () => {
    expect(
      parseEntityReferenceUrl(
        "/accounts(abcd1234-ab12-ab12-ab12-abcdef123456)"
      )
    ).toEqual({
      entityType: "accounts",
      id: "abcd1234-ab12-ab12-ab12-abcdef123456",
    });
  });

  it("returns null when the string doesn't match the expected shape", () => {
    expect(parseEntityReferenceUrl("not a url")).toBeNull();
  });
});

describe("toDataverseDateOnly", () => {
  it("formats a UTC date as YYYY-MM-DD", () => {
    const date = new Date(Date.UTC(2026, 5, 19)); // June 19 2026
    expect(toDataverseDateOnly(date)).toBe("2026-06-19");
  });
});

describe("safeParse", () => {
  it("parses a valid JSON string", () => {
    expect(safeParse<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });

  it("returns null for an invalid JSON string", () => {
    expect(safeParse("not json")).toBeNull();
  });

  it("passes through non-string values unchanged", () => {
    expect(safeParse({ a: 1 })).toEqual({ a: 1 });
  });

  it("returns null for null/undefined input", () => {
    expect(safeParse(null)).toBeNull();
    expect(safeParse(undefined)).toBeNull();
  });
});
