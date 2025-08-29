import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MovieCard } from "./MovieCard";

const movie = {
  id: 123,
  title: "A Very Long Movie Title That We Will Not Read",
  overview: "A short description appears in the overlay.",
  poster_path: "/abc.jpg",
  vote_average: 7.8,
  release_date: "2024-01-01",
} as any;

const renderCard = () =>
  render(
    <MemoryRouter>
      <MovieCard movie={movie} />
    </MemoryRouter>
  );

it("renders poster and rating and link", () => {
  renderCard();
  expect(screen.getByAltText(movie.title)).toBeInTheDocument();
  expect(screen.getByText("7.8")).toBeInTheDocument(); // badge text
  const link = screen.getByRole("link");
  expect(link).toHaveAttribute("href", `/movie/${movie.id}`);
});

it("contains the overview overlay block in the DOM", () => {
  renderCard();
  // The text may be truncated via CSS, but should exist
  expect(
    screen.getByText(/A short description appears/i)
  ).toBeInTheDocument();
});
