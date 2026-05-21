import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { UserRole } from "@callmaster/shared";

// Mock the toast hook
vi.mock("../../../shared/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock the ApiClient
vi.mock("../../../shared/api/ApiClient", () => ({
  apiClient: {
    post: vi.fn().mockResolvedValue({}),
  },
}));

describe("DashboardLayout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should show Tenants link pointing to /admin/tenants for Platform Owner", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: "admin@callmaster.ai",
        role: UserRole.PlatformOwner,
      }),
    );

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <DashboardLayout />
      </MemoryRouter>,
    );

    // The Tenants link should exist and point to /admin/tenants
    const tenantsLink = screen.getByText("Tenants");
    expect(tenantsLink).toBeInTheDocument();
    expect(tenantsLink.closest("a")).toHaveAttribute("href", "/admin/tenants");
  });

  it("should highlight Dashboard link as active when on /admin/dashboard", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: "admin@callmaster.ai",
        role: UserRole.PlatformOwner,
      }),
    );

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <DashboardLayout />
      </MemoryRouter>,
    );

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink?.className).toContain("bg-secondary");
  });

  it("should NOT show Tenants link for Tenant Admin", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: "tenant@org.com",
        role: UserRole.TenantAdmin,
      }),
    );

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <DashboardLayout />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Tenants")).not.toBeInTheDocument();
  });
});
