import { useState, useEffect } from "react";
import { apiClient } from "../ApiClient";
import type { TenantSummaryResponse } from "../types/analytics";

interface UseTenantSummaryResult {
  data: TenantSummaryResponse | null;
  loading: boolean;
  error: string | null;
}

export function useTenantSummary(): UseTenantSummaryResult {
  const [data, setData] = useState<TenantSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get<TenantSummaryResponse>("/analytics/tenant-summary")
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message ?? "Failed to load analytics data");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
