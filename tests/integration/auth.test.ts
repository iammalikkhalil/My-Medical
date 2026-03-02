import { describe, expect, it } from "vitest";

import { createSessionToken, verifySessionToken } from "@/lib/auth";

describe("session token", () => {
  it("creates and validates a signed session token", async () => {
    const token = await createSessionToken("admin", true);
    const session = await verifySessionToken(token);

    expect(session).not.toBeNull();
    expect(session?.username).toBe("admin");
  });

  it("rejects an invalid token", async () => {
    const session = await verifySessionToken("invalid.token.value");
    expect(session).toBeNull();
  });
});

