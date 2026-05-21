import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TenantAdminDashboard } from "./TenantAdminDashboard";

describe("TenantAdminDashboard", () => {
  it("should render the AnalyticOverview with KPIs and chart", () => {
    render(<TenantAdminDashboard />);

    expect(screen.getByText("Calls")).toBeInTheDocument();
    expect(screen.getByText("Conversion")).toBeInTheDocument();
    expect(screen.getByText("Agents")).toBeInTheDocument();
    expect(screen.getByText("Calls / hour")).toBeInTheDocument();
    expect(screen.getByText("last 24 h")).toBeInTheDocument();
  });
});
