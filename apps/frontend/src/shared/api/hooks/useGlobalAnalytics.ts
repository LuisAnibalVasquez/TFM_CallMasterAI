import { useState, useEffect } from "react";
import { apiClient } from "../ApiClient";
import type { GlobalAnalyticsResponse } from "../types/analytics";

interface UseGlobalAnalyticsResult {
  data: GlobalAnalyticsResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches global analytics data (all tenants, PlatformOwner only).
 * The backend enforces PlatformOwner role — non-admin users receive 403.
 */
export function useGlobalAnalytics(): UseGlobalAnalyticsResult {
  const [data, setData] = useState<GlobalAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get<GlobalAnalyticsResponse>("/analytics/global")
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load global analytics",
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
