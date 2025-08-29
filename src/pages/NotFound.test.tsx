// src/pages/NotFound.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, it, beforeEach, vi, expect } from "vitest";

// Mock router location so the component sees a missing path
vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/missing" }),
}));

// Minimal shadcn Button that supports `asChild`
vi.mock("@/components/ui/button", () => {
  const React = require("react");
  const Button = ({ asChild, children, ...props }: any) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { ...props, ...children.props });
    }
    return <button {...props}>{children}</button>;
  };
  return { Button };
});

// Icon stub to avoid SVG churn
vi.mock("lucide-react", () => ({
  ArrowLeft: (props: any) => <svg data-testid="arrow-icon" {...props} />,
}));

// ⬇️ Adjust this path if your file is elsewhere
import NotFound from "./NotFound";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("<NotFound />", () => {
  it("renders 404 content and a link back home", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
    expect(
      screen.getByText(/seems to have disappeared from our database/i)
    ).toBeInTheDocument();

    // The Button uses asChild → underlying element is an <a href="/">
    const backLink = screen.getByRole("link", { name: /back to home/i });
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("logs a descriptive error with the attempted pathname", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<NotFound />);

    await waitFor(() => {
      expect(errSpy).toHaveBeenCalled();
    });

    const [msg, path] = errSpy.mock.calls[0];
    expect(String(msg)).toMatch(/404 Error: User attempted to access non-existent route:/i);
    expect(path).toBe("/missing");

    errSpy.mockRestore();
  });
});
