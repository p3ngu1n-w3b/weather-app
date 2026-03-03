import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "../search-bar";

describe("SearchBar", () => {
  it("renders search input and submit button", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText(/London, UK or New York/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("calls onSearch with parsed city and country when form is submitted", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole("textbox", { name: /city or location/i });
    await user.type(input, "London, UK");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith("London", "UK");
  });

  it("calls onSearch with city only when no comma", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole("textbox", { name: /city or location/i });
    await user.type(input, "Tokyo");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith("Tokyo", undefined);
  });

  it("disables submit when input is empty", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByRole("button", { name: /search/i })).toBeDisabled();
  });

  it("shows recent queries when provided", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <SearchBar onSearch={onSearch} recentQueries={["London, UK", "Paris"]} />
    );
    await user.click(screen.getByText("London, UK"));
    expect(onSearch).toHaveBeenCalledWith("London", "UK");
  });
});
