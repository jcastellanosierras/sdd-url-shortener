import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- mock for tests
    <img src="" alt={alt} />
  ),
}));

describe("App smoke", () => {
  it("renders the home page", () => {
    render(<Home />);
    expect(screen.getByText(/Acortador de URLs/i)).toBeInTheDocument();
  });
});
