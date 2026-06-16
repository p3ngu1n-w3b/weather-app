import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Badge, Button } from "@/components/ui";

describe("Badge", () => {
  it("renders a humanised status label", () => {
    render(<Badge status="in_progress" />);
    expect(screen.getByText("in progress")).toBeInTheDocument();
  });
});

describe("Button", () => {
  it("fires onClick when pressed", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(screen.getByText("Save"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
