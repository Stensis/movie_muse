import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./Header";

vi.mock("@/components/ui/SearchBar", () => ({
  SearchBar: ({ onSearch, placeholder, className }: any) => (
    <input
      placeholder={placeholder ?? "Search"}
      className={className}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") onSearch((e.target as HTMLInputElement).value);
      }}
    />
  ),
}));

// ✅ Simple native-select mock for shadcn/Radix Select
vi.mock("@/components/ui/select", () => {
  return {
    Select: ({ children, onValueChange, defaultValue }: any) => (
      <select
        aria-label="Sort"
        defaultValue={defaultValue}
        onChange={(e) => onValueChange?.((e.target as HTMLSelectElement).value)}
      >
        {children}
      </select>
    ),
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectValue: ({ placeholder }: any) => (
      <option disabled value="__placeholder">
        {placeholder}
      </option>
    ),
    // Turn SelectItem into an <option>
    SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  };
});

it("submits search and changes sort", async () => {
  const user = userEvent.setup();
  const onSearch = vi.fn();
  const onSortChange = vi.fn();

  render(<Header onSearch={onSearch} onSortChange={onSortChange} />);

  // search
  const input = screen.getByPlaceholderText(/search movies/i);
  await user.type(input, "dune{Enter}");
  expect(onSearch).toHaveBeenCalledWith("dune");

  // sort (now a native <select>)
  const select = screen.getByLabelText(/sort/i);
  await user.selectOptions(select, "popularity");
  expect(onSortChange).toHaveBeenCalledWith("popularity");
});
