import { describe, it, expect } from "vitest";
import { generateSlug } from "@/lib/slug";

describe("generateSlug", () => {
  it("returns string of default length 8", () => {
    const slug = generateSlug();
    expect(slug).toHaveLength(8);
    expect(typeof slug).toBe("string");
  });

  it("returns URL-safe alphanumeric characters only", () => {
    const slug = generateSlug(20);
    expect(slug).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it("accepts custom length", () => {
    expect(generateSlug(4)).toHaveLength(4);
    expect(generateSlug(12)).toHaveLength(12);
  });

  it("generates different slugs on multiple calls", () => {
    const set = new Set<string>();
    for (let i = 0; i < 50; i++) {
      set.add(generateSlug());
    }
    expect(set.size).toBe(50);
  });
});
