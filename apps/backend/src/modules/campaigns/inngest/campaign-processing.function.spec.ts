import { CampaignStatus } from "@callmaster/shared";

// We test the pure processing logic, not the Inngest wrapper.
// The Inngest function delegates to this.
import { processCampaignCalls } from "./campaign-processing.function";

describe("processCampaignCalls", () => {
  let mockRepo: {
    findCallsByCampaign: jest.Mock;
    update: jest.Mock;
    updateCall: jest.Mock;
    findById: jest.Mock;
  };
  let mockProvider: { triggerCall: jest.Mock };
  let mockSend: jest.Mock;

  const mockCalls = [
    {
      id: "call-1",
      campaignId: "c1",
      customerName: "John Doe",
      phoneEncrypted: "+14155552671",
      phoneHash: "hash1",
      language: "English",
      age: 30,
      status: "pending",
      cost: 0,
      createdAt: new Date(),
    },
    {
      id: "call-2",
      campaignId: "c1",
      customerName: "Jane Smith",
      phoneEncrypted: "+34666111222",
      phoneHash: "hash2",
      language: "Spanish",
      age: 25,
      status: "pending",
      cost: 0,
      createdAt: new Date(),
    },
    {
      id: "call-3",
      campaignId: "c1",
      customerName: "Bob Wilson",
      phoneEncrypted: "+442071838750",
      phoneHash: "hash3",
      language: "English",
      age: 45,
      status: "pending",
      cost: 0,
      createdAt: new Date(),
    },
  ];

  const mockCampaign = makeCampaign();

  function makeCampaign(overrides: Partial<any> = {}) {
    return {
      id: "c1",
      tenantId: "tenant-1",
      name: "Test",
      status: CampaignStatus.IN_PROGRESS,
      environment: "Sandbox" as any,
      csvUrl: "",
      totalCalls: 10,
      successfulCalls: 0,
      failedCalls: 0,
      totalCost: 0,
      createdAt: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    mockRepo = {
      findCallsByCampaign: jest.fn(),
      update: jest.fn(),
      updateCall: jest.fn(),
      findById: jest.fn(),
    };
    mockProvider = {
      triggerCall: jest.fn(),
    };
    mockSend = jest.fn().mockResolvedValue({ ids: ["sent-event-id"] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch calls, process them sequentially, compute snapshot, and mark completed", async () => {
    mockRepo.findCallsByCampaign.mockResolvedValue(mockCalls);
    mockRepo.findById.mockResolvedValue(mockCampaign);

    // All calls succeed
    mockProvider.triggerCall
      .mockResolvedValueOnce({ success: true, externalId: "vf-1" })
      .mockResolvedValueOnce({ success: true, externalId: "vf-2" })
      .mockResolvedValueOnce({ success: true, externalId: "vf-3" });

    mockRepo.updateCall.mockResolvedValue({
      ...mockCalls[0],
      status: "completed",
      cost: 1.5,
    });
    mockRepo.update.mockResolvedValue({
      ...mockCampaign,
      status: CampaignStatus.COMPLETED,
    });

    await processCampaignCalls(
      { data: { campaignId: "c1", tenantId: "tenant-1" } },
      {
        repository: mockRepo as any,
        agentProvider: mockProvider as any,
        sendEvent: mockSend,
      },
    );

    // Should fetch calls
    expect(mockRepo.findCallsByCampaign).toHaveBeenCalledWith("c1");

    // Should process all 3 calls sequentially (concurrency: 1 is enforced by invoke order)
    expect(mockProvider.triggerCall).toHaveBeenCalledTimes(3);

    // Each call should be updated
    expect(mockRepo.updateCall).toHaveBeenCalledTimes(3);
    expect(mockRepo.updateCall).toHaveBeenCalledWith(
      "call-1",
      expect.objectContaining({ status: "completed" }),
    );
    expect(mockRepo.updateCall).toHaveBeenCalledWith(
      "call-2",
      expect.objectContaining({ status: "completed" }),
    );
    expect(mockRepo.updateCall).toHaveBeenCalledWith(
      "call-3",
      expect.objectContaining({ status: "completed" }),
    );

    // Campaign should be updated with snapshot and COMPLETED status
    expect(mockRepo.update).toHaveBeenCalledWith("c1", {
      status: CampaignStatus.COMPLETED,
      totalCalls: 3,
      successfulCalls: 3,
      failedCalls: 0,
      totalCost: expect.any(Number) as number,
    });

    // Should emit campaign.completed event
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ name: "campaign.completed" }),
    );
    const sendArg = mockSend.mock.calls[0][0];
    expect(sendArg.data.campaignId).toBe("c1");
  });

  it("should handle failed calls and compute snapshot correctly", async () => {
    mockRepo.findCallsByCampaign.mockResolvedValue(mockCalls);
    mockRepo.findById.mockResolvedValue(mockCampaign);

    // 1st call succeeds, 2nd fails, 3rd succeeds
    mockProvider.triggerCall
      .mockResolvedValueOnce({ success: true, externalId: "vf-1" })
      .mockResolvedValueOnce({ success: false, error: "Connection error" })
      .mockResolvedValueOnce({ success: true, externalId: "vf-3" });

    mockRepo.updateCall.mockResolvedValue({} as any);
    mockRepo.update.mockResolvedValue({
      ...mockCampaign,
      status: CampaignStatus.COMPLETED,
    } as any);

    await processCampaignCalls(
      { data: { campaignId: "c1", tenantId: "tenant-1" } },
      {
        repository: mockRepo as any,
        agentProvider: mockProvider as any,
        sendEvent: mockSend,
      },
    );

    // Failed call should be marked as "failed"
    expect(mockRepo.updateCall).toHaveBeenCalledWith(
      "call-2",
      expect.objectContaining({ status: "failed" }),
    );

    // Snapshot should reflect 2 success, 1 failure
    const updateArgs = mockRepo.update.mock.calls[0][1];
    expect(updateArgs.successfulCalls).toBe(2);
    expect(updateArgs.failedCalls).toBe(1);
    expect(updateArgs.totalCalls).toBe(3);
  });

  it("should complete even when no calls exist", async () => {
    mockRepo.findCallsByCampaign.mockResolvedValue([]);
    mockRepo.findById.mockResolvedValue(mockCampaign);
    mockRepo.update.mockResolvedValue({
      ...mockCampaign,
      status: CampaignStatus.COMPLETED,
    } as any);

    await processCampaignCalls(
      { data: { campaignId: "c1", tenantId: "tenant-1" } },
      {
        repository: mockRepo as any,
        agentProvider: mockProvider as any,
        sendEvent: mockSend,
      },
    );

    expect(mockProvider.triggerCall).not.toHaveBeenCalled();
    expect(mockRepo.update).toHaveBeenCalledWith(
      "c1",
      expect.objectContaining({
        status: CampaignStatus.COMPLETED,
        totalCalls: 0,
      }),
    );
    expect(mockSend).toHaveBeenCalled();
  });
});
