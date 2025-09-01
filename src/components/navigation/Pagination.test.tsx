import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "./Pagination";

it("calls onPageChange when clicking next/prev", () => {
  const onPageChange = vi.fn();
  render(
    <Pagination
      currentPage={2}
      totalPages={10}
      totalResults={100}
      onPageChange={onPageChange}
    />
  );

  fireEvent.click(screen.getByRole("button", { name: /previous/i }));
  expect(onPageChange).toHaveBeenCalledWith(1);

  fireEvent.click(screen.getByRole("button", { name: /next/i }));
  expect(onPageChange).toHaveBeenCalledWith(3);
});
