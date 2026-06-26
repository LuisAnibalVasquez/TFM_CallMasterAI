import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CallsChart } from "./CallsChart";

const sampleData = [
  { hour: "2026-06-25T00:00:00Z", count: 5 },
  { hour: "2026-06-25T01:00:00Z", count: 10 },
  { hour: "2026-06-25T02:00:00Z", count: 2 },
];

describe("CallsChart", () => {
  it("should render the chart area with Calls / hour label", () => {
    render(<CallsChart />);

    expect(screen.getByText("Calls / hour")).toBeInTheDocument();
    expect(screen.getByText("last 24 h")).toBeInTheDocument();
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

  it("should render a dynamic path when callsPerHour data is provided", () => {
    render(<CallsChart callsPerHour={sampleData} />);

    const svg = screen.getByRole("img", { name: "Calls per hour chart" });
    const paths = svg.querySelectorAll("path");
    expect(paths.length).toBeGreaterThanOrEqual(2);
    // Both paths should contain M (move-to) and L (line-to) commands
    const areaPath = paths[0].getAttribute("d") ?? "";
    const linePath = paths[1].getAttribute("d") ?? "";
    expect(areaPath).toContain("M");
    expect(areaPath).toContain("L");
    expect(linePath).toContain("M");
    expect(linePath).toContain("L");
  });

  it('should show "no data" label when callsPerHour is empty', () => {
    render(<CallsChart callsPerHour={[]} />);

    expect(screen.getByText("no data")).toBeInTheDocument();
  });
});
