import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, it, beforeEach, vi, expect } from "vitest";

// ──────────────────────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────────────────────

// 1) react-router-dom: we mock useSearchParams with a tiny in-memory store
let __params = new URLSearchParams("");
const __setSearch = (init: string | Record<string, string>) => {
  __params = new URLSearchParams(
    typeof init === "string"
      ? init
      : Object.entries(init)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join("&")
  );
};
const __getSearch = () => new URLSearchParams(__params.toString());

vi.mock("react-router-dom", async () => {
  // We only need useSearchParams here.
  return {
    useSearchParams: () => {
      const setParams = (next: URLSearchParams, _opts?: { replace?: boolean }) => {
        __params = new URLSearchParams(next);
      };
      return [__params, setParams] as const;
    },
  };
});

// 2) Toast hook
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastSpy }),
}));

// 3) Child components – minimal DOM so we can assert behavior
vi.mock("@/components/layout/Header", () => ({
  Header: ({ onSearch, onSortChange }: any) => (
    <div data-testid="header">
      <input aria-label="Search Input" />
      <button
        onClick={() => {
          const input = document.querySelector<HTMLInputElement>('input[aria-label="Search Input"]');
          onSearch?.(input?.value ?? "batman");
        }}
      >
        Submit Search
      </button>
      <button onClick={() => onSortChange?.("title")}>Sort by Title</button>
    </div>
  ),
}));

vi.mock("@/components/layout/Sidebar", () => ({
  Sidebar: ({ onCategoryChange }: any) => (
    <div data-testid="sidebar">
      <button onClick={() => onCategoryChange?.("trending")}>Go Trending</button>
    </div>
  ),
}));

vi.mock("@/components/movies/MovieGrid", () => ({
  MovieGrid: ({ movies, isLoading }: any) => (
    <div data-testid="grid">{isLoading ? "loading" : movies.map((m: any) => m.title).join(",")}</div>
  ),
}));

vi.mock("@/components/navigation/Pagination", () => ({
  Pagination: ({ onPageChange, currentPage, totalPages }: any) => (
    <div data-testid="pagination">
      <span>p={currentPage}/{totalPages}</span>
      <button onClick={() => onPageChange?.(2)}>Go Page 2</button>
    </div>
  ),
}));

vi.mock("@/components/movies/HeroBanner", () => ({
  HeroBannerCarousel: ({ movies }: any) => (
    <div data-testid="hero">HERO:{movies.length}</div>
  ),
}));

vi.mock("@/components/ui/LoadingSpinner", () => ({
  LoadingSpinner: () => <div role="status">Loading…</div>,
}));

// 4) react-query: stub useQuery per-test
const useQueryMock = vi.fn();
vi.mock("@tanstack/react-query", async () => {
  const actual: any = await vi.importActual("@tanstack/react-query");
  return { ...actual, useQuery: (...args: any[]) => useQueryMock(...args) };
});

// 5) tmdb service: not used directly because we stub useQuery, but keep it safe
vi.mock("@/services/tmdb", () => ({
  tmdbApi: {
    getPopularMovies: vi.fn(),
    getTrendingMovies: vi.fn(),
    getTopRatedMovies: vi.fn(),
    getNowPlayingMovies: vi.fn(),
    getUpcomingMovies: vi.fn(),
    searchMovies: vi.fn(),
  },
}));

// ──────────────────────────────────────────────────────────────────────────────
// Test data and helpers
// ──────────────────────────────────────────────────────────────────────────────

const moviesResponse = {
  page: 1,
  total_pages: 3,
  total_results: 100,
  results: [
    { id: 1, title: "Zed", vote_average: 5, popularity: 50, release_date: "2020-01-01" },
    { id: 2, title: "Alpha", vote_average: 8.5, popularity: 99, release_date: "2024-01-01" },
    { id: 3, title: "Mid", vote_average: 7, popularity: 60, release_date: "2023-03-03" },
  ],
} as const;

const setUseQueryReturn = (over: Partial<{
  data: any; isLoading: boolean; isError: boolean;
}>) => {
  useQueryMock.mockImplementation(() => ({
    data: over.data,
    isLoading: over.isLoading ?? false,
    isError: over.isError ?? false,
  }));
};

// Needed by onPageChange
global.scrollTo = vi.fn();

// Component under test
import Index from "./Index";

// Reset shared state before each test
beforeEach(() => {
  vi.clearAllMocks();
  __setSearch(""); // clear ?params
});

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

describe("<Index />", () => {
  it("shows loading spinner when isLoading and no data yet", () => {
    setUseQueryReturn({ data: undefined, isLoading: true });
    render(<Index />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });

  it("renders hero + default heading for popular when not searching", () => {
    setUseQueryReturn({ data: moviesResponse, isLoading: false });
    render(<Index />);

    // Hero rendered because no search query
    expect(screen.getByTestId("hero")).toHaveTextContent("HERO:");

    // Heading for default category "popular"
    expect(screen.getByRole("heading", { name: /popular movies/i })).toBeInTheDocument();

    // Grid shows titles sorted by default 'score' (vote_average desc): Alpha (8.5), Mid (7), Zed (5)
    expect(screen.getByTestId("grid").textContent).toBe("Alpha,Mid,Zed");
  });

  it('when searching (?q=batman), hides hero and shows "All Results for …"', () => {
    __setSearch({ q: "batman", page: "1", cat: "search" });
    setUseQueryReturn({ data: moviesResponse, isLoading: false });

    render(<Index />);

    expect(screen.queryByTestId("hero")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /all results for “batman”/i })).toBeInTheDocument();
  });

  it("emits a destructive toast on error", () => {
    setUseQueryReturn({ data: undefined, isLoading: false, isError: true });
    render(<Index />);

    expect(toastSpy).toHaveBeenCalledTimes(1);
    const arg = toastSpy.mock.calls[0][0];
    expect(arg.variant).toBe("destructive");
  });

  it("Pagination onPageChange updates ?page and scrolls to top", async () => {
    __setSearch({ page: "1" });
    setUseQueryReturn({ data: moviesResponse, isLoading: false });
    const user = userEvent.setup();

    render(<Index />);

    await user.click(screen.getByRole("button", { name: /go page 2/i }));
    const params = __getSearch();
    expect(params.get("page")).toBe("2");
    expect(global.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("Sidebar category change sets ?cat and resets ?q and ?page", async () => {
    __setSearch({ q: "batman", page: "7", cat: "search" });
    setUseQueryReturn({ data: moviesResponse, isLoading: false });
    const user = userEvent.setup();

    render(<Index />);
    await user.click(screen.getByRole("button", { name: /go trending/i }));

    const params = __getSearch();
    expect(params.get("cat")).toBe("trending");
    expect(params.get("q")).toBeNull();
    expect(params.get("page")).toBe("1");
  });

  it("Header search writes ?q, sets cat=search and page=1", async () => {
    setUseQueryReturn({ data: moviesResponse, isLoading: false });
    const user = userEvent.setup();

    render(<Index />);
    const input = screen.getByLabelText(/search input/i);
    await user.type(input, "matrix");
    await user.click(screen.getByRole("button", { name: /submit search/i }));

    const params = __getSearch();
    expect(params.get("q")).toBe("matrix");
    expect(params.get("cat")).toBe("search");
    expect(params.get("page")).toBe("1");
  });

  it("Sort change to 'title' re-renders grid alphabetically", async () => {
    setUseQueryReturn({ data: moviesResponse, isLoading: false });
    const user = userEvent.setup();

    // initial render
    const { rerender } = render(<Index />);
    expect(screen.getByTestId("grid").textContent).toBe("Alpha,Mid,Zed"); // default 'score'

    // click "Sort by Title" -> updates ?sort=title in our mock
    await user.click(screen.getByRole("button", { name: /sort by title/i }));

    // simulate a re-render (router would normally do this)
    rerender(<Index />);

    // Alphabetical by title: Alpha, Mid, Zed
    expect(screen.getByTestId("grid").textContent).toBe("Alpha,Mid,Zed");
  });
});
