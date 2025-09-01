import { formatRating, formatRuntime, getImageUrl } from "@/services/tmdb";

describe("utils", () => {
  it("formatRuntime", () => {
    expect(formatRuntime(0)).toBe("0h 0m");
    expect(formatRuntime(135)).toBe("2h 15m");
  });

  it("formatRating", () => {
    expect(formatRating(7.234)).toBe("7.2");
    expect(formatRating(0)).toBe("0.0");
  });

  it("getImageUrl", () => {
    expect(getImageUrl(null)).toBe("/placeholder.svg");
    expect(getImageUrl("/abc.jpg", "w200")).toBe(
      "https://image.tmdb.org/t/p/w200/abc.jpg"
    );
  });
});
