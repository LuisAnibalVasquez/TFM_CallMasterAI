import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhoneCall } from "lucide-react";
import { KpiCard } from "./KpiCard";

describe("KpiCard", () => {
  it("should render label, value, and delta from props", () => {
    render(
      <KpiCard
        icon={<PhoneCall data-testid="kpi-icon" />}
        label="Calls"
        value="12,847"
        delta="+18.2%"
      />,
    );

    expect(screen.getByText("Calls")).toBeInTheDocument();
    expect(screen.getByText("12,847")).toBeInTheDocument();
    expect(screen.getByText("+18.2%")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-icon")).toBeInTheDocument();
  });

  it("should apply accent color to delta when highlight is true", () => {
    render(
      <KpiCard
        icon={<PhoneCall />}
        label="Conversion"
        value="34.6%"
        delta="+4.1%"
        highlight
      />,
    );

    const deltaElement = screen.getByText("+4.1%");
    expect(deltaElement.className).toContain("text-accent");
  });

  it("should use muted foreground color when highlight is false", () => {
    render(
      <KpiCard
        icon={<PhoneCall />}
        label="Calls"
        value="12,847"
        delta="+18.2%"
        highlight={false}
      />,
    );

    const deltaElement = screen.getByText("+18.2%");
    expect(deltaElement.className).toContain("text-muted-foreground");
  });

  it("should default delta to muted color when highlight is omitted", () => {
    render(
      <KpiCard icon={<PhoneCall />} label="Agents" value="48" delta="online" />,
    );

    const deltaElement = screen.getByText("online");
    expect(deltaElement.className).toContain("text-muted-foreground");
  });

  it("should not render delta when the prop is omitted", () => {
    render(<KpiCard icon={<PhoneCall />} label="Campaigns" value="12" />);

    expect(screen.getByText("Campaigns")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    // No delta element should be present — only the two text nodes above
    const deltaElements = screen.queryAllByText(/[+%]/);
    expect(deltaElements).toHaveLength(0);
  });
});
