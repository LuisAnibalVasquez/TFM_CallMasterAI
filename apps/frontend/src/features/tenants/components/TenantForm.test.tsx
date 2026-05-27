// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt3 on Tue May 26 2026
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TenantForm } from "./TenantForm";

const { mockCreateTenant, mockUpdateTenant, capturedToastRef } = vi.hoisted(
  () => {
    const ref: { current: Record<string, unknown> | null } = { current: null };
    return {
      mockCreateTenant: vi.fn(),
      mockUpdateTenant: vi.fn(),
      capturedToastRef: ref,
    };
  },
);

// Mock hooks
vi.mock("../hooks/useTenants", () => ({
  useCreateTenant: () => ({
    createTenant: mockCreateTenant,
    isCreating: false,
    result: null,
  }),
  useUpdateTenant: () => ({
    updateTenant: mockUpdateTenant,
    isUpdating: false,
  }),
}));

// Mock useToast
vi.mock("../../../shared/hooks/use-toast", () => ({
  useToast: () => ({
    toast: (props: Record<string, unknown>) => {
      capturedToastRef.current = props;
    },
  }),
}));

describe("TenantForm — Zod + RHF validation", () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    capturedToastRef.current = null;
  });

  const getCapturedToast = () => capturedToastRef.current;

  // ── Create mode: blocks empty submission ──
  it("should show validation errors when submitting empty create form", async () => {
    const user = userEvent.setup();
    render(
      <TenantForm
        tenant={null}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: /create tenant/i }));

    await waitFor(() => {
      expect(mockCreateTenant).not.toHaveBeenCalled();
      const toast = getCapturedToast();
      expect(toast).toBeTruthy();
      expect(toast?.variant).toBe("destructive");
    });
  });

  // ── Create mode: invalid email blocked ──
  it("should block create with invalid email format", async () => {
    const user = userEvent.setup();
    render(
      <TenantForm
        tenant={null}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    await user.type(screen.getByLabelText("Company Name *"), "Acme Corp");
    await user.type(screen.getByLabelText("Admin Email *"), "bad-email");

    await user.click(screen.getByRole("button", { name: /create tenant/i }));

    await waitFor(() => {
      expect(mockCreateTenant).not.toHaveBeenCalled();
      const toast = getCapturedToast();
      expect(toast).toBeTruthy();
      expect(toast?.variant).toBe("destructive");
    });
  });

  // ── Create mode: missing sandbox config blocked ──
  it("should block create when sandbox API config is missing", async () => {
    const user = userEvent.setup();
    render(
      <TenantForm
        tenant={null}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    await user.type(screen.getByLabelText("Company Name *"), "Acme Corp");
    await user.type(screen.getByLabelText("Admin Email *"), "admin@acme.com");
    // Open sandbox section
    const expandButtons = screen.getAllByRole("button", {
      name: /sandbox ai configuration/i,
    });
    await user.click(expandButtons[0]);
    // Don't fill sandbox config — leave empty
    await user.click(screen.getByRole("button", { name: /create tenant/i }));

    await waitFor(() => {
      expect(mockCreateTenant).not.toHaveBeenCalled();
      const toast = getCapturedToast();
      expect(toast).toBeTruthy();
    });
  });

  // ── Create mode: valid create calls API ──
  it("should call createTenant with valid create form data", async () => {
    const user = userEvent.setup();
    render(
      <TenantForm
        tenant={null}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    // Fill basic fields first using userEvent (known to work with RHF)
    await user.type(screen.getByLabelText("Company Name *"), "Acme Corp");
    await user.type(screen.getByLabelText("Admin Email *"), "admin@acme.com");

    // Open sandbox section
    await user.click(
      screen.getByRole("button", { name: /sandbox ai configuration/i }),
    );

    // Wait for sandbox fields to render
    const sandboxUrl = await screen.findByLabelText("API Base URL *");
    const sandboxKey = screen.getByLabelText("API Key *");

    await user.type(sandboxUrl, "https://sandbox.api.com");
    await user.type(sandboxKey, "sk-sandbox-key");

    // Open production section
    await user.click(
      screen.getByRole("button", { name: /production ai configuration/i }),
    );

    // Now there are 2 "API Base URL *" and 2 "API Key *"
    const urls = screen.getAllByLabelText("API Base URL *");
    const keys = screen.getAllByLabelText("API Key *");
    // urls[0] = sandbox (already filled), urls[1] = production
    // keys[0] = sandbox (already filled), keys[1] = production
    await user.type(urls[1], "https://prod.api.com");
    await user.type(keys[1], "sk-prod-key");

    await user.click(screen.getByRole("button", { name: /create tenant/i }));

    await waitFor(
      () => {
        expect(mockCreateTenant).toHaveBeenCalled();
      },
      { timeout: 5000 },
    );
  });

  // ── Edit mode: renders with existing data ──
  it("should render edit form with existing tenant data", () => {
    render(
      <TenantForm
        tenant={
          {
            id: "1",
            name: "Existing Corp",
            contactEmail: "existing@corp.com",
            phone: "+1234567890",
            contactPerson: "Jane Doe",
            logoUrl: "https://logo.com/img.png",
            status: "active" as any,
            sandboxConfig: { apiUrl: "https://sb.com", encryptedKey: "" },
            productionConfig: { apiUrl: "https://prod.com", encryptedKey: "" },
          } as any
        }
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    expect(
      (screen.getByLabelText("Company Name *") as HTMLInputElement).value,
    ).toBe("Existing Corp");
    expect(
      (screen.getByLabelText("Admin Email *") as HTMLInputElement).value,
    ).toBe("existing@corp.com");
  });
});
