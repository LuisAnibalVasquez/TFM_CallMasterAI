import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlatformOwnerDashboard } from "./PlatformOwnerDashboard";

// Mock the TenantList to detect if it's rendered (should NOT be after restructuring)
vi.mock("../../tenants/components/TenantList", () => ({
  TenantList: () => <div data-testid="tenant-list">TenantList Component</div>,
}));

describe("PlatformOwnerDashboard", () => {
  it("should render AnalyticOverview with empty state (platform analytics out of scope)", () => {
    render(<PlatformOwnerDashboard />);

    // Should NOT render TenantList
    expect(screen.queryByTestId("tenant-list")).not.toBeInTheDocument();

    // Platform Owner global analytics is out of scope, so empty state is shown
    expect(screen.getByText("No campaign data yet")).toBeInTheDocument();
    expect(screen.getByText(/Create your first campaign/)).toBeInTheDocument();
  });
});
