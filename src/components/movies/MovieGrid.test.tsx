import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MovieGrid } from "./MovieGrid";

const mk = (id: number) =>
  ({ id, title: `M${id}`, poster_path: null, vote_average: 0 } as any);

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

it("shows skeletons while loading", () => {
  renderWithRouter(<MovieGrid movies={[]} isLoading />);
  // skeletons expose role="status"
  expect(
    screen.getAllByRole("status", { name: /loading movie/i })
  ).toHaveLength(12);
});

it("shows empty state when no movies", () => {
  renderWithRouter(<MovieGrid movies={[]} isLoading={false} />);
  expect(screen.getByText(/no movies found/i)).toBeInTheDocument();
});

it("renders cards when movies exist", () => {
  renderWithRouter(<MovieGrid movies={[mk(1), mk(2), mk(3)]} />);
  expect(screen.getAllByRole("link")).toHaveLength(3);
});
