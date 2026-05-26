export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    // VITE_API_URL should be defined in .env files
    // Using typeof check to prevent ReferenceError in non-vite test environments
    let defaultUrl =
      typeof import.meta !== "undefined" && import.meta.env
        ? import.meta.env.VITE_API_URL
        : "/api";

    // Force proxy usage in local development even if Vite cached the old .env var
    if (
      defaultUrl.includes("localhost:3000") ||
      defaultUrl.includes("127.0.0.1:3000")
    ) {
      defaultUrl = "/api";
    }

    this.baseUrl = baseUrl || defaultUrl || "/api";
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const basePath = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint;
    const baseOrigin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost";

    // Si basePath ya es una URL absoluta (ej. http://localhost:3000/api),
    // new URL(basePath, baseOrigin) la va a tomar bien ignorando el baseOrigin.
    // Si es relativa (ej. /api), usará baseOrigin.
    const fullUrl = new URL(basePath, baseOrigin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        fullUrl.searchParams.append(key, String(value));
      });
    }
    return fullUrl.toString();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...customConfig } = options;

    const url = this.buildUrl(endpoint, params);

    const config: RequestInit = {
      ...customConfig,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: "include", // Use cookies for auth
    };

    // Include credentials (cookies) by default for auth endpoints if needed,
    // though the user might specify this in customConfig.
    if (!config.credentials) {
      config.credentials = "include";
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        throw new ApiError(
          response.status,
          errorData.message || "An API error occurred",
          errorData,
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Handle network errors (e.g., CORS, offline)
      throw new ApiError(
        0,
        error instanceof Error ? error.message : "Network error",
      );
    }
  }

  get<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Export a singleton instance for general use
export const apiClient = new ApiClient();
