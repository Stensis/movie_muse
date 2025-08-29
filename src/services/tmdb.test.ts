import { tmdbApi } from "./tmdb";

describe("tmdbApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the correct endpoint with query params (popular movies)", async () => {
    const mockJson = { results: [], page: 2, total_pages: 1, total_results: 0 };
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(mockJson) });

    vi.stubGlobal("fetch", fetchMock);

    const data = await tmdbApi.getPopularMovies(2);
    expect(data).toEqual(mockJson);

    // check URL & params
    const called = fetchMock.mock.calls[0][0] as string;
    const url = new URL(called);
    expect(url.pathname).toContain("/movie/popular");
    expect(url.searchParams.get("page")).toBe("2");
    // Don’t assert the actual API key value, just that it's present
    expect(url.searchParams.has("api_key")).toBe(true);
  });

  it("throws on non-ok response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Bad Request",
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(tmdbApi.getPopularMovies(1)).rejects.toThrow(/API request failed/i);
  });
});
