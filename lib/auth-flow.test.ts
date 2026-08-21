import { describe, expect, it } from "vitest";

type AccountType = "company" | "agent";

function parseAccountType(type: string | null): AccountType {
  return type === "company" ? "company" : "agent";
}

function buildRegisterPayload(
  accountType: AccountType,
  fields: Record<string, string>,
): Record<string, string> {
  return { ...fields, account_type: accountType };
}

function wrongDoorRedirect(
  actual: AccountType,
  email: string,
): string {
  const params = new URLSearchParams({ type: actual, email });
  return `/login?${params.toString()}`;
}

describe("registration persona helpers", () => {
  it("defaults missing type to agent", () => {
    expect(parseAccountType(null)).toBe("agent");
    expect(parseAccountType("agent")).toBe("agent");
    expect(parseAccountType("company")).toBe("company");
  });

  it("always sends account_type on submit", () => {
    const payload = buildRegisterPayload("company", {
      name: "Pat",
      email: "pat@co.com",
      password: "Password1!",
    });
    expect(payload.account_type).toBe("company");
    expect(payload.email).toBe("pat@co.com");
  });

  it("redirects wrong-door login to matching persona", () => {
    expect(wrongDoorRedirect("agent", "a@b.com")).toBe(
      "/login?type=agent&email=a%40b.com",
    );
  });
});
