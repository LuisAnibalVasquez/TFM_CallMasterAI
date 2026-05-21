import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiClient, ApiError } from "./ApiClient";

describe("ApiClient", () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();

    // Stub import.meta.env properly in Vite context using vi.stubEnv if supported,
    // or by mocking the entire env object
    vi.stubEnv("VITE_API_URL", "http://test-api.com");

    // We instantiate a fresh client to ensure it reads the mocked env var
    apiClient = new ApiClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make a successful GET request", async () => {
    const mockData = { id: 1, name: "Test Tenant" };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await apiClient.get("/tenants");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://test-api.com/tenants",
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(result).toEqual(mockData);
  });

  it("should construct URL with query parameters", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiClient.get("/search", { params: { q: "test", page: 1 } });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://test-api.com/search?q=test&page=1",
      expect.any(Object),
    );
  });

  it("should handle API errors (non-2xx responses)", async () => {
    const errorMessage = "Unauthorized";
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: errorMessage }),
    });

    try {
      await apiClient.get("/secure-endpoint");
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(401);
      expect((error as ApiError).message).toBe(errorMessage);
    }
  });

  it("should handle network errors", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    await expect(apiClient.get("/endpoint")).rejects.toThrow("Network error");
    await expect(apiClient.get("/endpoint")).rejects.toBeInstanceOf(ApiError);
  });

  it("should make a POST request with body", async () => {
    const postData = { name: "New Tenant" };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 2, ...postData }),
    });

    await apiClient.post("/tenants", postData);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://test-api.com/tenants",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(postData),
      }),
    );
  });

  it("should handle 204 No Content responses correctly", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const result = await apiClient.delete("/tenants/1");

    expect(result).toEqual({});
  });
});
