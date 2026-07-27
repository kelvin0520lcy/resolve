import { describe, expect, it } from "vitest";
import {
  getDailyMotivation,
  MOTIVATION_QUOTES,
} from "@/lib/daily-motivation";

describe("daily character motivation", () => {
  it("provides a long, balanced library of original character-toned lines", () => {
    expect(MOTIVATION_QUOTES).toHaveLength(48);
    expect(new Set(MOTIVATION_QUOTES.map((quote) => quote.id)).size).toBe(48);
    for (const member of ["bocchi", "nijika", "ryo", "kita"]) {
      expect(
        MOTIVATION_QUOTES.filter((quote) => quote.member === member),
      ).toHaveLength(12);
    }
    expect(
      MOTIVATION_QUOTES.every(
        (quote) =>
          quote.text.length > 45 &&
          quote.textJa.length > 15 &&
          quote.memberName.length > 0 &&
          quote.memberNameEn.length > 0 &&
          quote.trait.length > 0 &&
          quote.traitJa.length > 0,
      ),
    ).toBe(true);
    expect(
      MOTIVATION_QUOTES.filter(
        (quote) =>
          quote.member === "bocchi" &&
          (quote.textJa.includes("……") ||
            /[あみだごこ]-?[、っ]/.test(quote.textJa)),
      ).length,
    ).toBeGreaterThanOrEqual(8);
  });

  it("returns the same quote for a user throughout one day", () => {
    expect(getDailyMotivation("2026-07-24", "user-1")).toEqual(
      getDailyMotivation("2026-07-24", "user-1"),
    );
  });

  it("rotates without repeating on consecutive days", () => {
    const ids = [
      "2026-07-24",
      "2026-07-25",
      "2026-07-26",
      "2026-07-27",
    ].map((date) => getDailyMotivation(date, "user-1").id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses the account seed to personalize the rotation", () => {
    expect(getDailyMotivation("2026-07-24", "user-1").id).not.toBe(
      getDailyMotivation("2026-07-24", "user-2").id,
    );
  });
});
