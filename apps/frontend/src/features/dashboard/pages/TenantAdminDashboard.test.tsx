import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TenantAdminDashboard } from "./TenantAdminDashboard";

// Mock the useTenantSummary hook
vi.mock("../../../shared/api/hooks/useTenantSummary", () => ({
  useTenantSummary: vi.fn(),
}));

import { useTenantSummary } from "../../../shared/api/hooks/useTenantSummary";

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

describe("TenantAdminDashboard", () => {
  it("should render KPI cards and chart when data is loaded", () => {
    vi.mocked(useTenantSummary).mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
    });

    render(<TenantAdminDashboard />);

    expect(screen.getByText("Calls")).toBeInTheDocument();
    expect(screen.getByText("Campaigns")).toBeInTheDocument();
    expect(screen.getByText("Minutes")).toBeInTheDocument();
    expect(screen.getByText("Cost")).toBeInTheDocument();
    expect(screen.getByText("Calls / hour")).toBeInTheDocument();
    expect(screen.getByText("last 24 h")).toBeInTheDocument();
  });

  it("should show loading state while data is fetching", () => {
    vi.mocked(useTenantSummary).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(<TenantAdminDashboard />);

    // Loading skeleton should be present
    const skeleton = document.querySelector(".animate-pulse");
    expect(skeleton).toBeTruthy();
  });

  it("should show error state when the fetch fails", () => {
    vi.mocked(useTenantSummary).mockReturnValue({
      data: null,
      loading: false,
      error: "Failed to load analytics data",
    });

    render(<TenantAdminDashboard />);

    expect(screen.getByText("Failed to load analytics")).toBeInTheDocument();
  });
});
