import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Watchlist from "./Watchlist";

// ➜ mock the watchlist hook to return no items
vi.mock("@/hooks/useWatchlist", () => ({
  useWatchlist: () => ({ ids: [], remove: vi.fn() }),
}));

it("shows empty state when no items", () => {
  const qc = new QueryClient();
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Watchlist />
      </MemoryRouter>
    </QueryClientProvider>
  );

  expect(screen.getByText(/my watchlist/i)).toBeInTheDocument();
  expect(screen.getByText(/you haven’t added any movies yet/i)).toBeInTheDocument();
});
