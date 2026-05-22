import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  campaignService,
  type PaginatedCampaigns,
  type CampaignData,
} from "./campaignService";

// Mock the apiClient
const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("../../../shared/api/ApiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

describe("campaignService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should call GET /campaigns with default pagination", async () => {
      const mockResponse: PaginatedCampaigns = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await campaignService.list();

      expect(mockGet).toHaveBeenCalledWith("/campaigns", {
        params: { page: 1, limit: 20 },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should call GET /campaigns with custom pagination", async () => {
      const mockResponse: PaginatedCampaigns = {
        data: [],
        total: 0,
        page: 2,
        limit: 10,
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await campaignService.list(2, 10);

      expect(mockGet).toHaveBeenCalledWith("/campaigns", {
        params: { page: 2, limit: 10 },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("create", () => {
    it("should call POST /campaigns with campaign data", async () => {
      const mockCampaign: CampaignData = {
        id: "camp-1",
        name: "Test Campaign",
        status: "Created",
        environment: "Sandbox",
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        createdAt: "2025-01-01T00:00:00Z",
        tenantId: "tenant-1",
      };
      mockPost.mockResolvedValue(mockCampaign);

      const result = await campaignService.create({
        name: "Test Campaign",
        environment: "Sandbox",
        csvContent: "header\ndata",
      });

      expect(mockPost).toHaveBeenCalledWith("/campaigns", {
        name: "Test Campaign",
        environment: "Sandbox",
        csvContent: "header\ndata",
      });
      expect(result).toEqual(mockCampaign);
    });

    it("should call POST /campaigns with Production environment", async () => {
      const mockCampaign: CampaignData = {
        id: "camp-2",
        name: "Prod Campaign",
        status: "Created",
        environment: "Production",
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        createdAt: "2025-01-02T00:00:00Z",
        tenantId: "tenant-1",
      };
      mockPost.mockResolvedValue(mockCampaign);

      const result = await campaignService.create({
        name: "Prod Campaign",
        environment: "Production",
        csvContent: "h\nd",
      });

      expect(mockPost).toHaveBeenCalledWith("/campaigns", {
        name: "Prod Campaign",
        environment: "Production",
        csvContent: "h\nd",
      });
      expect(result).toEqual(mockCampaign);
    });
  });

  describe("start", () => {
    it("should call POST /campaigns/:id/start", async () => {
      const mockCampaign: CampaignData = {
        id: "camp-1",
        name: "Test Campaign",
        status: "In-Progress",
        environment: "Sandbox",
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        createdAt: "2025-01-01T00:00:00Z",
        tenantId: "tenant-1",
      };
      mockPost.mockResolvedValue(mockCampaign);

      const result = await campaignService.start("camp-1");

      expect(mockPost).toHaveBeenCalledWith("/campaigns/camp-1/start");
      expect(result).toEqual(mockCampaign);
    });

    it("should call POST for a different campaign id", async () => {
      const mockCampaign: CampaignData = {
        id: "camp-X",
        name: "Camp X",
        status: "In-Progress",
        environment: "Production",
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        createdAt: "2025-01-01T00:00:00Z",
        tenantId: "tenant-1",
      };
      mockPost.mockResolvedValue(mockCampaign);

      const result = await campaignService.start("camp-X");

      expect(mockPost).toHaveBeenCalledWith("/campaigns/camp-X/start");
      expect(result).toEqual(mockCampaign);
    });
  });

  describe("cancel", () => {
    it("should call POST /campaigns/:id/cancel", async () => {
      const mockCampaign: CampaignData = {
        id: "camp-1",
        name: "Test Campaign",
        status: "Cancelled",
        environment: "Sandbox",
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        createdAt: "2025-01-01T00:00:00Z",
        tenantId: "tenant-1",
      };
      mockPost.mockResolvedValue(mockCampaign);

      const result = await campaignService.cancel("camp-1");

      expect(mockPost).toHaveBeenCalledWith("/campaigns/camp-1/cancel");
      expect(result).toEqual(mockCampaign);
    });

    it("should call POST for a different campaign id", async () => {
      const mockCampaign: CampaignData = {
        id: "camp-Y",
        name: "Camp Y",
        status: "Cancelled",
        environment: "Production",
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        createdAt: "2025-01-01T00:00:00Z",
        tenantId: "tenant-1",
      };
      mockPost.mockResolvedValue(mockCampaign);

      const result = await campaignService.cancel("camp-Y");

      expect(mockPost).toHaveBeenCalledWith("/campaigns/camp-Y/cancel");
      expect(result).toEqual(mockCampaign);
    });
  });

  describe("downloadTemplate", () => {
    it("should call GET /campaigns/template and return the URL", async () => {
      mockGet.mockResolvedValue({
        url: "https://storage.example.com/template.csv",
      });

      const result = await campaignService.downloadTemplate();

      expect(mockGet).toHaveBeenCalledWith("/campaigns/template");
      expect(result).toBe("https://storage.example.com/template.csv");
    });

    it("should handle a different URL format", async () => {
      mockGet.mockResolvedValue({
        url: "https://cdn.example.com/template.csv?token=abc",
      });

      const result = await campaignService.downloadTemplate();

      expect(mockGet).toHaveBeenCalledWith("/campaigns/template");
      expect(result).toBe("https://cdn.example.com/template.csv?token=abc");
    });
  });
});
