import { describe, expect, it } from "vitest";

import { calculateDurationDays } from "@/lib/time";

describe("calculateDurationDays", () => {
  it("returns at least one day", () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    const recovery = new Date("2026-01-01T06:00:00.000Z");
    expect(calculateDurationDays(start, recovery)).toBe(1);
  });

  it("calculates inclusive day span", () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    const recovery = new Date("2026-01-03T00:00:00.000Z");
    expect(calculateDurationDays(start, recovery)).toBe(3);
  });
});

