import { apiClient } from "../../../shared/api/ApiClient";
import type {
  Tenant,
  CreateTenantInput,
  UpdateTenantInput,
} from "@callmaster/shared";

export interface CreateTenantResult {
  tenant: Tenant;
  adminCredentials: {
    email: string;
    temporaryPassword: string;
  };
}

export interface PaginatedTenants {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
}

export const tenantService = {
  list: (page = 1, limit = 20) =>
    apiClient.get<PaginatedTenants>("/tenants", {
      params: { page, limit },
    }),

  create: (input: CreateTenantInput) =>
    apiClient.post<CreateTenantResult>("/tenants", input),

  update: (id: string, input: UpdateTenantInput) =>
    apiClient.put<Tenant>(`/tenants/${id}`, input),

  delete: (id: string) => apiClient.delete<void>(`/tenants/${id}`),
};
