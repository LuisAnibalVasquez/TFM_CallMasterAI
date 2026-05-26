import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CallsChart } from "./CallsChart";

describe("CallsChart", () => {
  it("should render the chart area with Calls / hour label", () => {
    render(<CallsChart />);

    expect(screen.getByText("Calls / hour")).toBeInTheDocument();
    expect(screen.getByText("last 24 h")).toBeInTheDocument();
    expect(screen.getByText("+12.4%")).toBeInTheDocument();
  });

  it("should render an SVG with the chart area and line paths", () => {
    render(<CallsChart />);

    const svg = screen.getByRole("img", { name: "Calls per hour chart" });
    expect(svg).toBeInTheDocument();
    expect(svg.tagName).toBe("svg");
  });

  it("should render a linear gradient definition for the area fill", () => {
    render(<CallsChart />);

    const svg = screen.getByRole("img", { name: "Calls per hour chart" });
    // The gradient should exist as a child of defs
    const gradient = svg.querySelector("linearGradient");
    expect(gradient).toBeTruthy();
    expect(gradient!.getAttribute("id")).toBe("cmai-area");
  });

  it("should accept an optional className prop", () => {
    render(<CallsChart className="my-custom-class" />);

    const container = screen.getByRole("img", {
      name: "Calls per hour chart",
    }).parentElement;
    expect(container?.className).toContain("my-custom-class");
  });
});
