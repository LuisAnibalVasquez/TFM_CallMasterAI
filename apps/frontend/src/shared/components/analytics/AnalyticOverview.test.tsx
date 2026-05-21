import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyticOverview } from "./AnalyticOverview";

describe("AnalyticOverview", () => {
  it("should render three KPI cards for Calls, Conversion, and Agents", () => {
    render(<AnalyticOverview />);

    // Verify all three KPI labels are present
    expect(screen.getByText("Calls")).toBeInTheDocument();
    expect(screen.getByText("Conversion")).toBeInTheDocument();
    expect(screen.getByText("Agents")).toBeInTheDocument();

    // Verify values are present
    expect(screen.getByText("12,847")).toBeInTheDocument();
    expect(screen.getByText("34.6%")).toBeInTheDocument();
    expect(screen.getByText("48")).toBeInTheDocument();
  });

  it("should render the CallsChart component", () => {
    render(<AnalyticOverview />);

    expect(screen.getByText("Calls / hour")).toBeInTheDocument();
    expect(screen.getByText("last 24 h")).toBeInTheDocument();
  });

  it("should render the CallsChart SVG", () => {
    render(<AnalyticOverview />);

    const svg = screen.getByRole("img", { name: "Calls per hour chart" });
    expect(svg).toBeInTheDocument();
  });
});
