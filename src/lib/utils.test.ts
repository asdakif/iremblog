import { describe, expect, it } from "vitest";
import { createSlug, stripHtml } from "@/lib/utils";

describe("utils", () => {
  it("creates a strict lowercase slug", () => {
    expect(createSlug("Merhaba Dünya! 2026")).toBe("merhaba-dunya-2026");
  });

  it("strips HTML tags from content", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
  });
});
