import {
  purgeCampaignData,
  CampaignCompletedOrCancelledEvent,
} from "./campaign-purge.function";

describe("purgeCampaignData", () => {
  let mockRepo: { redactCalls: jest.Mock };
  let mockLogger: { log: jest.Mock };

  beforeEach(() => {
    mockRepo = {
      redactCalls: jest.fn(),
    };
    mockLogger = {
      log: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should redact sensitive data for all calls in the completed campaign", async () => {
    mockRepo.redactCalls.mockResolvedValue(5);

    const event: CampaignCompletedOrCancelledEvent = {
      name: "campaign.completed",
      data: { campaignId: "c1", tenantId: "tenant-1" },
    };

    await purgeCampaignData(
      event,
      { repository: mockRepo as any },
      mockLogger as any,
    );

    expect(mockRepo.redactCalls).toHaveBeenCalledWith("c1");
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining("Redacted 5 records"),
    );
  });

  it("should redact data when campaign is cancelled", async () => {
    mockRepo.redactCalls.mockResolvedValue(10);

    const event: CampaignCompletedOrCancelledEvent = {
      name: "campaign.cancelled",
      data: { campaignId: "c2", tenantId: "tenant-1" },
    };

    await purgeCampaignData(
      event,
      { repository: mockRepo as any },
      mockLogger as any,
    );

    expect(mockRepo.redactCalls).toHaveBeenCalledWith("c2");
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining("Redacted 10 records"),
    );
  });

  it("should handle campaigns with no calls", async () => {
    mockRepo.redactCalls.mockResolvedValue(0);

    const event: CampaignCompletedOrCancelledEvent = {
      name: "campaign.completed",
      data: { campaignId: "c3", tenantId: "tenant-1" },
    };

    await purgeCampaignData(
      event,
      { repository: mockRepo as any },
      mockLogger as any,
    );

    expect(mockRepo.redactCalls).toHaveBeenCalledWith("c3");
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining("Redacted 0 records"),
    );
  });

  it("should log error if redaction fails but not throw", async () => {
    mockRepo.redactCalls.mockRejectedValue(new Error("DB error"));

    const event: CampaignCompletedOrCancelledEvent = {
      name: "campaign.completed",
      data: { campaignId: "c1", tenantId: "tenant-1" },
    };

    // Should not throw
    await purgeCampaignData(
      event,
      { repository: mockRepo as any },
      mockLogger as any,
    );

    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining("Failed to redact"),
    );
  });
});
