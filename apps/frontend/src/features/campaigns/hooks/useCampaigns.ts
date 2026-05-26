import { useState, useEffect, useCallback } from "react";
import {
  campaignService,
  type CampaignData,
  type CreateCampaignInput,
  type PaginatedCampaigns,
} from "../services/campaignService";

export function useCampaigns(page = 1, limit = 20) {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result: PaginatedCampaigns = await campaignService.list(
        page,
        limit,
      );
      setCampaigns(result.data);
      setTotal(result.total);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch campaigns",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, total, isLoading, error, refetch: fetchCampaigns };
}

export function useCreateCampaign() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCampaign = useCallback(async (input: CreateCampaignInput) => {
    setIsCreating(true);
    setError(null);
    try {
      return await campaignService.create(input);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create campaign";
      setError(message);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    createCampaign,
    isCreating,
    error,
    clearError: () => setError(null),
  };
}

export function useStartCampaign() {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCampaign = useCallback(async (id: string) => {
    setIsStarting(true);
    setError(null);
    try {
      return await campaignService.start(id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to start campaign";
      setError(message);
      throw err;
    } finally {
      setIsStarting(false);
    }
  }, []);

  return { startCampaign, isStarting, error, clearError: () => setError(null) };
}

export function useCancelCampaign() {
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelCampaign = useCallback(async (id: string) => {
    setIsCanceling(true);
    setError(null);
    try {
      return await campaignService.cancel(id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to cancel campaign";
      setError(message);
      throw err;
    } finally {
      setIsCanceling(false);
    }
  }, []);

  return {
    cancelCampaign,
    isCanceling,
    error,
    clearError: () => setError(null),
  };
}
