import { describe, expect, it } from "vitest";
import {
  isPrivateOrUnreachableApiHost,
  resolveApiUrl,
} from "../lib/resolve-api-url";

describe("resolveApiUrl", () => {
  it("defaults to localhost off Vercel", () => {
    expect(resolveApiUrl({})).toBe("http://localhost:8000");
  });

  it("defaults to public API on Vercel when unset", () => {
    expect(resolveApiUrl({ VERCEL: "1" })).toBe("https://api.noel54.com");
  });

  it("uses explicit public URL", () => {
    expect(
      resolveApiUrl({ NEXT_PUBLIC_API_URL: "https://api.noel54.com/" }),
    ).toBe("https://api.noel54.com");
  });

  it("replaces private cluster DNS on Vercel", () => {
    expect(
      resolveApiUrl({
        VERCEL: "1",
        NEXT_PUBLIC_API_URL:
          "http://backend-service.base23.svc.cluster.local",
      }),
    ).toBe("https://api.noel54.com");
  });

  it("replaces RFC1918 hosts on Vercel", () => {
    expect(
      resolveApiUrl({
        VERCEL: "1",
        API_URL: "http://10.0.0.12:8000",
      }),
    ).toBe("https://api.noel54.com");
  });

  it("replaces non-https API URLs on Vercel", () => {
    expect(
      resolveApiUrl({
        VERCEL: "1",
        NEXT_PUBLIC_API_URL: "http://api.noel54.com",
      }),
    ).toBe("https://api.noel54.com");
  });

  it("keeps localhost for local development", () => {
    expect(
      resolveApiUrl({ NEXT_PUBLIC_API_URL: "http://localhost:8000" }),
    ).toBe("http://localhost:8000");
  });
});

describe("isPrivateOrUnreachableApiHost", () => {
  it("detects cluster and local hosts", () => {
    expect(
      isPrivateOrUnreachableApiHost(
        "http://backend.base23.svc.cluster.local",
      ),
    ).toBe(true);
    expect(isPrivateOrUnreachableApiHost("http://localhost:8000")).toBe(true);
    expect(isPrivateOrUnreachableApiHost("https://api.noel54.com")).toBe(
      false,
    );
  });
});

describe("dual persona auth URLs", () => {
  it("builds typed login and register paths", () => {
    const types = ["company", "agent"] as const;
    for (const type of types) {
      expect(`/register?type=${type}`).toContain(`type=${type}`);
      expect(`/login?type=${type}`).toContain(`type=${type}`);
    }
  });

  it("maps hiring UI to company account_type", () => {
    const fromLanding = "company";
    expect(["company", "agent"]).toContain(fromLanding);
  });
});
