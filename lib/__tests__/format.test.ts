import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, initials, relativeDueLabel, titleCase } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats values as ZAR", () => {
    const out = formatCurrency(12000);
    expect(out).toContain("12");
    expect(out).toMatch(/R/);
  });
  it("handles zero / falsy", () => {
    expect(formatCurrency(0)).toMatch(/R/);
  });
});

describe("formatDate", () => {
  it("returns a dash for empty values", () => {
    expect(formatDate("")).toBe("—");
    expect(formatDate(null)).toBe("—");
  });
  it("formats an ISO date", () => {
    expect(formatDate("2025-01-15")).toMatch(/2025/);
  });
});

describe("titleCase", () => {
  it("converts snake_case to Title Case", () => {
    expect(titleCase("in_progress")).toBe("In Progress");
  });
});

describe("initials", () => {
  it("returns up to two uppercase initials", () => {
    expect(initials("Lerato Mokoena")).toBe("LM");
    expect(initials("Sipho")).toBe("S");
  });
});

describe("relativeDueLabel", () => {
  it("flags overdue dates", () => {
    expect(relativeDueLabel("2000-01-01").tone).toBe("overdue");
  });
  it("returns none for empty", () => {
    expect(relativeDueLabel("").tone).toBe("none");
  });
  it("flags today as soon", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(relativeDueLabel(today).tone).toBe("soon");
  });
});
