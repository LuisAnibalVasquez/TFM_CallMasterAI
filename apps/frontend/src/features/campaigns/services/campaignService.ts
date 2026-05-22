import { apiClient } from "../../../shared/api/ApiClient";

export interface CampaignData {
  id: string;
  tenantId: string;
  name: string;
  status: string;
  environment: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalCost: number;
  createdAt: string;
}

export interface CreateCampaignInput {
  name: string;
  environment: string;
  csvContent: string;
}

export interface PaginatedCampaigns {
  data: CampaignData[];
  total: number;
  page: number;
  limit: number;
}

export const campaignService = {
  list: (page = 1, limit = 20) =>
    apiClient.get<PaginatedCampaigns>("/campaigns", {
      params: { page, limit },
    }),

  create: (input: CreateCampaignInput) =>
    apiClient.post<CampaignData>("/campaigns", input),

  start: (id: string) => apiClient.post<CampaignData>(`/campaigns/${id}/start`),

  cancel: (id: string) =>
    apiClient.post<CampaignData>(`/campaigns/${id}/cancel`),

  downloadTemplate: async (): Promise<string> => {
    const result = await apiClient.get<{ url: string }>("/campaigns/template");
    return result.url;
  },
};
