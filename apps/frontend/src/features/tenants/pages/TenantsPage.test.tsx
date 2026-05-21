import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TenantsPage } from "./TenantsPage";

// Mock TenantList to verify delegation
vi.mock("../components/TenantList", () => ({
  TenantList: () => <div data-testid="tenant-list">TenantList Component</div>,
}));

describe("TenantsPage", () => {
  it("should delegate to TenantList and show page title", () => {
    render(<TenantsPage />);

    // Verify TenantList is rendered
    expect(screen.getByTestId("tenant-list")).toBeInTheDocument();

    // Verify page title
    expect(screen.getByText("Tenant Management")).toBeInTheDocument();
  });
});
