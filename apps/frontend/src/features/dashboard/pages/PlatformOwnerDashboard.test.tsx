import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlatformOwnerDashboard } from "./PlatformOwnerDashboard";

// Mock the TenantList to detect if it's rendered (should NOT be after restructuring)
vi.mock("../../tenants/components/TenantList", () => ({
  TenantList: () => <div data-testid="tenant-list">TenantList Component</div>,
}));

describe("PlatformOwnerDashboard", () => {
  it("should render AnalyticOverview instead of TenantList after restructuring", () => {
    render(<PlatformOwnerDashboard />);

    // After restructuring, should NOT render TenantList
    expect(screen.queryByTestId("tenant-list")).not.toBeInTheDocument();

    // Should show KPI labels from AnalyticOverview
    expect(screen.getByText("Calls")).toBeInTheDocument();
    expect(screen.getByText("Conversion")).toBeInTheDocument();
    expect(screen.getByText("Agents")).toBeInTheDocument();
    expect(screen.getByText("Calls / hour")).toBeInTheDocument();
  });
});
