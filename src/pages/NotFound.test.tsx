// src/pages/NotFound.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, it, beforeAll, afterAll, vi, expect } from "vitest";

vi.mock("react-router-dom", () => ({ useLocation: () => ({ pathname: "/missing" }) }));
vi.mock("@/components/ui/button", () => {
  const React = require("react");
  const Button = ({ asChild, children, ...props }: any) =>
    asChild && React.isValidElement(children)
      ? React.cloneElement(children, { ...props, ...children.props })
      : <button {...props}>{children}</button>;
  return { Button };
});
vi.mock("lucide-react", () => ({ ArrowLeft: (p: any) => <svg data-testid="arrow" {...p} /> }));

import NotFound from "./NotFound";

let errSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  // silence console.error for this suite but keep spying
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  errSpy.mockRestore();
});

describe("<NotFound />", () => {
  it("renders 404 content and a link back home", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });

  it("logs a descriptive error with the attempted pathname", async () => {
    render(<NotFound />);
    await waitFor(() => expect(errSpy).toHaveBeenCalled());
    const [msg, path] = errSpy.mock.calls[0];
    expect(String(msg)).toMatch(/404 Error: User attempted to access non-existent route:/i);
    expect(path).toBe("/missing");
  });
});
