import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { FC } from "react";

const Boom: FC = () => {
  throw new Error("boom");
  return null;
};

it("renders fallback when child throws", () => {
  render(
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>
  );
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
