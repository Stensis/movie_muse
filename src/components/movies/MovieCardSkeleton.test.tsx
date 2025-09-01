import { render, screen } from "@testing-library/react";
import { MovieCardSkeleton } from "./MovieCardSkeleton";

it("renders an accessible loading skeleton", () => {
  render(<MovieCardSkeleton />);
  const el = screen.getByRole("status", { name: /loading movie/i });
  expect(el).toBeInTheDocument();
  // Optional: also verify the test id if you want
  expect(screen.getByTestId("movie-skeleton")).toBe(el);
});
