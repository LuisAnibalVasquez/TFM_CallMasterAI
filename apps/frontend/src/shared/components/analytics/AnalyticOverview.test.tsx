import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyticOverview } from "./AnalyticOverview";

const mockData = {
  kpis: {
    totalCalls: 1250,
    totalCampaigns: 12,
    totalMinutes: 5400,
    totalCostUSD: 450.75,
    successRate: 0.85,
  },
  trends: {
    callsPerHour: [
      { hour: "2026-06-25T10:00:00Z", count: 45 },
      { hour: "2026-06-25T11:00:00Z", count: 62 },
    ],
  },
};

describe("AnalyticOverview", () => {
  it("should render four KPI cards when data is provided", () => {
    render(<AnalyticOverview data={mockData} />);

    expect(screen.getByText("Calls")).toBeInTheDocument();
    expect(screen.getByText("Campaigns")).toBeInTheDocument();
    expect(screen.getByText("Minutes")).toBeInTheDocument();
    expect(screen.getByText("Cost")).toBeInTheDocument();
  });

  it("should display formatted KPI values from data", () => {
    render(<AnalyticOverview data={mockData} />);

    expect(screen.getByText("1,250")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("$450.75")).toBeInTheDocument();
  });

  it("should render the CallsChart with callsPerHour data", () => {
    render(<AnalyticOverview data={mockData} />);

    expect(screen.getByText("Calls / hour")).toBeInTheDocument();
    expect(screen.getByText("last 24 h")).toBeInTheDocument();
    const svg = screen.getByRole("img", { name: "Calls per hour chart" });
    expect(svg).toBeInTheDocument();
  });

  it("should render a loading skeleton when loading is true", () => {
    render(<AnalyticOverview loading />);

    // The skeleton has 4 placeholder cards (h-20) and a chart placeholder (h-28)
    const container = document.querySelector(".animate-pulse");
    expect(container).toBeTruthy();
    // Should not render KPI labels or chart during loading
    expect(screen.queryByText("Calls")).not.toBeInTheDocument();
    expect(screen.queryByText("Calls / hour")).not.toBeInTheDocument();
  });

  it("should render an error state when error is provided", () => {
    render(<AnalyticOverview data={null} error="Network Error" />);

    expect(screen.getByText("Failed to load analytics")).toBeInTheDocument();
    expect(screen.getByText("Network Error")).toBeInTheDocument();
  });

  it("should render an empty state when totalCalls is 0", () => {
    render(
      <AnalyticOverview
        data={{
          kpis: { ...mockData.kpis, totalCalls: 0 },
          trends: { callsPerHour: [] },
        }}
      />,
    );

    expect(screen.getByText("No campaign data yet")).toBeInTheDocument();
    expect(screen.getByText(/Create your first campaign/)).toBeInTheDocument();
  });

  it("should render an empty state when data is null", () => {
    render(<AnalyticOverview data={null} />);

    expect(screen.getByText("No campaign data yet")).toBeInTheDocument();
  });
});
