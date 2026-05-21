import { useState, useEffect, useCallback } from "react";
import {
  tenantService,
  type PaginatedTenants,
  type CreateTenantResult,
} from "../services/tenantService";
import type {
  Tenant,
  CreateTenantInput,
  UpdateTenantInput,
} from "@callmaster/shared";

export function useTenants(page = 1, limit = 20) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result: PaginatedTenants = await tenantService.list(page, limit);
      setTenants(result.data);
      setTotal(result.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch tenants");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return { tenants, total, isLoading, error, refetch: fetchTenants };
}

export function useCreateTenant() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateTenantResult | null>(null);

  const createTenant = useCallback(async (input: CreateTenantInput) => {
    setIsCreating(true);
    setError(null);
    setResult(null);
    try {
      const res = await tenantService.create(input);
      setResult(res);
      return res;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create tenant";
      setError(message);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    createTenant,
    isCreating,
    error,
    result,
    clearResult: () => setResult(null),
  };
}

export function useUpdateTenant() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTenant = useCallback(
    async (id: string, input: UpdateTenantInput) => {
      setIsUpdating(true);
      setError(null);
      try {
        return await tenantService.update(id, input);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update tenant";
        setError(message);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  return { updateTenant, isUpdating, error };
}

export function useDeleteTenant() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTenant = useCallback(async (id: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      await tenantService.delete(id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete tenant";
      setError(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteTenant, isDeleting, error };
}
