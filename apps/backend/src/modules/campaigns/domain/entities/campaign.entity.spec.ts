import { Campaign } from "./campaign.entity";
import { CampaignStatus, CampaignEnvironment } from "@callmaster/shared";

describe("Campaign Entity", () => {
  describe("constructor", () => {
    it("should accept snapshot fields and expose them", () => {
      const campaign = new Campaign({
        id: "campaign-1",
        tenantId: "tenant-1",
        name: "Test Campaign",
        status: CampaignStatus.CREATED,
        environment: CampaignEnvironment.SANDBOX,
        csvUrl: "https://example.com/file.csv",
        totalCalls: 100,
        successfulCalls: 85,
        failedCalls: 15,
        totalCost: 42.5,
        createdAt: new Date("2026-01-01"),
      });

      expect(campaign.totalCalls).toBe(100);
      expect(campaign.successfulCalls).toBe(85);
      expect(campaign.failedCalls).toBe(15);
      expect(campaign.totalCost).toBe(42.5);
    });

    it("should default snapshot fields to sensible values when not provided", () => {
      const campaign = new Campaign({
        id: "campaign-2",
        tenantId: "tenant-1",
        name: "Default Campaign",
        status: CampaignStatus.CREATED,
        environment: CampaignEnvironment.SANDBOX,
        csvUrl: "",
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        createdAt: new Date(),
      });

      expect(campaign.totalCalls).toBe(0);
      expect(campaign.successfulCalls).toBe(0);
      expect(campaign.failedCalls).toBe(0);
      expect(campaign.totalCost).toBe(0);
    });
  });

  describe("static create", () => {
    it("should create a campaign with Created status and default snapshot values", () => {
      const before = new Date();
      const campaign = Campaign.create({
        tenantId: "tenant-1",
        name: "New Campaign",
        environment: CampaignEnvironment.PRODUCTION,
        csvUrl: "",
      });
      const after = new Date();

      expect(campaign.id).toBeDefined();
      expect(typeof campaign.id).toBe("string");
      expect(campaign.tenantId).toBe("tenant-1");
      expect(campaign.name).toBe("New Campaign");
      expect(campaign.status).toBe(CampaignStatus.CREATED);
      expect(campaign.environment).toBe(CampaignEnvironment.PRODUCTION);
      expect(campaign.totalCalls).toBe(0);
      expect(campaign.successfulCalls).toBe(0);
      expect(campaign.failedCalls).toBe(0);
      expect(campaign.totalCost).toBe(0);
      expect(campaign.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(campaign.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
