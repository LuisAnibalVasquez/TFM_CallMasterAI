// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt3 on Tue May 26 2026
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "./LoginPage";

const { mockPost, mockNavigate, capturedToastRef } = vi.hoisted(() => {
  const toastRef: { current: Record<string, unknown> | null } = {
    current: null,
  };
  return {
    mockPost: vi.fn(),
    mockNavigate: vi.fn(),
    capturedToastRef: toastRef,
  };
});

// Mock ApiClient
vi.mock("../../../shared/api/ApiClient", () => ({
  __esModule: true,
  ApiError: class extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
  ApiClient: class {},
  apiClient: {
    post: mockPost,
  },
}));

// Mock useToast
vi.mock("../../../shared/hooks/use-toast", () => ({
  useToast: () => ({
    toast: (props: Record<string, unknown>) => {
      capturedToastRef.current = props;
    },
  }),
}));

// Mock useNavigate (keep MemoryRouter working)
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage — Zod + RHF validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedToastRef.current = null;
    mockPost.mockReset();
    mockNavigate.mockReset();
    Storage.prototype.setItem = vi.fn();
  });

  const renderLogin = () =>
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

  const getCapturedToast = () => capturedToastRef.current;

  // ── Valid submission calls API ──
  it("should call API when email and password are valid", async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValueOnce({
      user: { id: "1", role: "TenantAdmin", email: "test@example.com" },
    });

    renderLogin();

    await user.type(screen.getByLabelText("Email address"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "securepass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "securepass",
      });
    });
  });

  // ── Invalid email blocked BEFORE network call ──
  it("should block submission and show toast error on invalid email format", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email address"), "bad-email");
    await user.type(screen.getByLabelText("Password"), "somepassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPost).not.toHaveBeenCalled();
      const toast = getCapturedToast();
      expect(toast).toBeTruthy();
      expect(toast?.variant).toBe("destructive");
      expect(toast?.title).toBeTruthy();
    });
  });

  // ── Empty password blocked ──
  it("should block submission and show toast error when password is empty", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email address"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPost).not.toHaveBeenCalled();
      const toast = getCapturedToast();
      expect(toast).toBeTruthy();
      expect(toast?.variant).toBe("destructive");
    });
  });

  // ── Both fields empty blocked ──
  it("should block submission when both fields are empty", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPost).not.toHaveBeenCalled();
      const toast = getCapturedToast();
      expect(toast).toBeTruthy();
      expect(toast?.variant).toBe("destructive");
    });
  });

  // ── Whitespace-only email blocked ──
  it("should block submission when email is only whitespace", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email address"), "   ");
    await user.type(screen.getByLabelText("Password"), "somepass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPost).not.toHaveBeenCalled();
      const toast = getCapturedToast();
      expect(toast).toBeTruthy();
      expect(toast?.variant).toBe("destructive");
    });
  });

  // ── Inline validation error message visible ──
  it("should display inline validation error for invalid email", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email address"), "bad-email");
    await user.type(screen.getByLabelText("Password"), "somepass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].textContent).toBeTruthy();
    });
  });
});
