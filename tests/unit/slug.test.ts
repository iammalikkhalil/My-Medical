import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("converts text into URL-safe slug", () => {
    expect(slugify("Pain & Fever")).toBe("pain-fever");
    expect(slugify("  Cold   & Flu  ")).toBe("cold-flu");
  });
});

