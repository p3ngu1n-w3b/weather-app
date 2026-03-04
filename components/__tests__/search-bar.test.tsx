import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "../search-bar";

describe("SearchBar", () => {
  it("renders search input and submit button", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Cape Town, Johannesburg/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("calls onSearch with city when form is submitted", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole("textbox", { name: /south african city/i });
    await user.type(input, "Cape Town");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith("Cape Town");
  });

  it("strips text after comma (SA only)", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole("textbox", { name: /south african city/i });
    await user.type(input, "Johannesburg, ZA");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith("Johannesburg");
  });

  it("disables submit when input is empty", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByRole("button", { name: /search/i })).toBeDisabled();
  });

  it("shows recent queries when provided", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <SearchBar onSearch={onSearch} recentQueries={["Cape Town", "Johannesburg"]} />
    );
    await user.click(screen.getByText("Cape Town"));
    expect(onSearch).toHaveBeenCalledWith("Cape Town");
  });
});
