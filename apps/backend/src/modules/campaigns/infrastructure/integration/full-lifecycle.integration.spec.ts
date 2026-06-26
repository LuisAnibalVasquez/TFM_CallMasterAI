/**
 * Task 5.6 — Full Campaign Lifecycle Integration Test
 *
 * Validates the complete campaign lifecycle end-to-end:
 *   Create → Start → Process → Complete → Snapshot → Purge → Verify Redaction
 *
 * This test exercises the pure processing functions (processCampaignCalls
 * and purgeCampaignData) with mock repositories, simulating the full flow
 * that Inngest orchestrates in production.
 */
import { CampaignStatus } from "@callmaster/shared";
import { processCampaignCalls } from "../../inngest/campaign-processing.function";
import { purgeCampaignData } from "../../inngest/campaign-purge.function";

describe("Campaign Full Lifecycle Integration", () => {
  // ── Shared repository mock ──────────────────────────────────────────
  let repository: {
    // ICampaignRepository subset used by processing + purge
    findById: jest.Mock;
    findCallsByCampaign: jest.Mock;
    update: jest.Mock;
    updateCall: jest.Mock;
    redactCalls: jest.Mock;
    create: jest.Mock;
    bulkInsertCalls: jest.Mock;
    delete: jest.Mock;
  };
  let agentProvider: { triggerCall: jest.Mock };
  let sendEvent: jest.Mock;
  let purgeLogger: { log: jest.Mock };
  let tenantsService: { findById: jest.Mock };
  let encryptionService: { decryptSecret: jest.Mock };

  const mockTenant = {
    id: "tenant-test-1",
    productionConfig: {
      apiUrl: "https://api.voiceflow.com",
      encryptedKey: "encrypted-hex-test",
    },
  };

  const masterKey = "mock-master-key";

  // ── Test campaign data ──────────────────────────────────────────────
  const campaignId = "campaign-lifecycle-1";
  const tenantId = "tenant-test-1";

  const makeCall = (overrides: Partial<any> = {}) => ({
    id: overrides.id ?? `call-${Math.random().toString(36).slice(2, 8)}`,
    campaignId,
    customerName: overrides.customerName ?? "Test Customer",
    phoneEncrypted: overrides.phoneEncrypted ?? "+14155552671",
    phoneHash: overrides.phoneHash ?? "hash-abc",
    language: overrides.language ?? "English",
    age: overrides.age ?? 30,
    status: overrides.status ?? "pending",
    cost: overrides.cost ?? 0,
    createdAt: overrides.createdAt ?? new Date(),
  });

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findCallsByCampaign: jest.fn(),
      update: jest.fn(),
      updateCall: jest.fn(),
      redactCalls: jest.fn(),
      create: jest.fn(),
      bulkInsertCalls: jest.fn(),
      delete: jest.fn(),
    };
    agentProvider = { triggerCall: jest.fn() };
    sendEvent = jest.fn().mockResolvedValue({ ids: ["evt-sent"] });
    purgeLogger = { log: jest.fn() };
    tenantsService = {
      findById: jest.fn().mockResolvedValue(mockTenant),
    };
    encryptionService = {
      decryptSecret: jest.fn().mockResolvedValue("decrypted-test-api-key"),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Scenario 1: Full happy path ─────────────────────────────────────
  it("should execute the full lifecycle: create → process → complete → snapshot → purge → redacted", async () => {
    // ── PHASE 1: Create campaign with 3 calls (simulated via repo mock) ──
    const calls = [
      makeCall({
        id: "call-1",
        customerName: "Alice",
        phoneEncrypted: "+14151110001",
      }),
      makeCall({
        id: "call-2",
        customerName: "Bob",
        phoneEncrypted: "+14151110002",
      }),
      makeCall({
        id: "call-3",
        customerName: "Carol",
        phoneEncrypted: "+14151110003",
      }),
    ];

    repository.findCallsByCampaign.mockResolvedValue(calls);

    // All calls succeed
    agentProvider.triggerCall
      .mockResolvedValueOnce({ success: true, externalId: "vf-a" })
      .mockResolvedValueOnce({ success: true, externalId: "vf-b" })
      .mockResolvedValueOnce({ success: true, externalId: "vf-c" });

    repository.updateCall.mockResolvedValue({} as any);
    repository.update.mockResolvedValue({
      id: campaignId,
      status: CampaignStatus.COMPLETED,
    } as any);

    // ── PHASE 2: Start and process ─────────────────────────────────────
    await processCampaignCalls(
      { data: { campaignId, tenantId } },
      {
        repository: repository as any,
        agentProvider: agentProvider as any,
        sendEvent,
        tenantsService: tenantsService as any,
        encryptionService: encryptionService as any,
        masterKey,
      },
    );

    // All 3 calls processed
    expect(agentProvider.triggerCall).toHaveBeenCalledTimes(3);
    expect(repository.updateCall).toHaveBeenCalledTimes(3);

    // Campaign snapshot computed with correct metrics
    expect(repository.update).toHaveBeenCalledWith(
      campaignId,
      expect.objectContaining({
        status: CampaignStatus.COMPLETED,
        totalCalls: 3,
        successfulCalls: 3,
        failedCalls: 0,
        totalCost: expect.any(Number) as number,
      }),
    );

    // campaign.completed event emitted (triggers purge in production)
    expect(sendEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "campaign.completed",
        data: { campaignId, tenantId },
      }),
    );

    // ── PHASE 3: Purge ─────────────────────────────────────────────────
    repository.redactCalls.mockResolvedValue(3);

    await purgeCampaignData(
      { name: "campaign.completed", data: { campaignId, tenantId } },
      { repository: repository as any },
      purgeLogger as any,
    );

    // All calls redacted
    expect(repository.redactCalls).toHaveBeenCalledWith(campaignId);
    expect(purgeLogger.log).toHaveBeenCalledWith(
      expect.stringContaining("Redacted 3 records"),
    );
  });

  // ── Scenario 2: Mixed success/failure ───────────────────────────────
  it("should compute correct snapshot with mixed success and failure", async () => {
    const calls = [
      makeCall({ id: "call-1", customerName: "Alice" }),
      makeCall({ id: "call-2", customerName: "Bob" }),
      makeCall({ id: "call-3", customerName: "Carol" }),
      makeCall({ id: "call-4", customerName: "Dave" }),
      makeCall({ id: "call-5", customerName: "Eve" }),
    ];

    repository.findCallsByCampaign.mockResolvedValue(calls);

    // Success, Fail, Success, Fail, Success = 3 success, 2 fail
    agentProvider.triggerCall
      .mockResolvedValueOnce({ success: true, externalId: "vf-1" })
      .mockResolvedValueOnce({ success: false, error: "Timeout" })
      .mockResolvedValueOnce({ success: true, externalId: "vf-3" })
      .mockResolvedValueOnce({ success: false, error: "Busy" })
      .mockResolvedValueOnce({ success: true, externalId: "vf-5" });

    repository.updateCall.mockResolvedValue({} as any);
    repository.update.mockResolvedValue({
      id: campaignId,
      status: CampaignStatus.COMPLETED,
    } as any);

    await processCampaignCalls(
      { data: { campaignId, tenantId } },
      {
        repository: repository as any,
        agentProvider: agentProvider as any,
        sendEvent,
        tenantsService: tenantsService as any,
        encryptionService: encryptionService as any,
        masterKey,
      },
    );

    const snapshotArg = repository.update.mock.calls[0][1];
    expect(snapshotArg.totalCalls).toBe(5);
    expect(snapshotArg.successfulCalls).toBe(3);
    expect(snapshotArg.failedCalls).toBe(2);
    expect(snapshotArg.status).toBe(CampaignStatus.COMPLETED);
  });

  // ── Scenario 3: Empty campaign ──────────────────────────────────────
  it("should complete campaign with zero calls and allow purge", async () => {
    repository.findCallsByCampaign.mockResolvedValue([]);
    repository.update.mockResolvedValue({
      id: campaignId,
      status: CampaignStatus.COMPLETED,
    } as any);
    repository.redactCalls.mockResolvedValue(0);

    await processCampaignCalls(
      { data: { campaignId, tenantId } },
      {
        repository: repository as any,
        agentProvider: agentProvider as any,
        sendEvent,
        tenantsService: tenantsService as any,
        encryptionService: encryptionService as any,
        masterKey,
      },
    );

    expect(agentProvider.triggerCall).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      campaignId,
      expect.objectContaining({
        status: CampaignStatus.COMPLETED,
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
      }),
    );

    // Purge should still work for empty campaigns
    await purgeCampaignData(
      { name: "campaign.completed", data: { campaignId, tenantId } },
      { repository: repository as any },
      purgeLogger as any,
    );

    expect(repository.redactCalls).toHaveBeenCalledWith(campaignId);
    expect(purgeLogger.log).toHaveBeenCalledWith(
      expect.stringContaining("Redacted 0 records"),
    );
  });

  // ── Scenario 4: Purge handles errors gracefully ─────────────────────
  it("should log purge errors without throwing (resilience)", async () => {
    repository.redactCalls.mockRejectedValue(new Error("DB connection lost"));

    await purgeCampaignData(
      { name: "campaign.completed", data: { campaignId, tenantId } },
      { repository: repository as any },
      purgeLogger as any,
    );

    expect(purgeLogger.log).toHaveBeenCalledWith(
      expect.stringContaining("Failed to redact"),
    );
    // Should not throw — resilience is key for background jobs
  });

  // ── Scenario 5: Processing preserves sequential order ────────────────
  it("should process calls in FIFO order (sequential invocation)", async () => {
    const calls = [
      makeCall({ id: "call-a", customerName: "First" }),
      makeCall({ id: "call-b", customerName: "Second" }),
      makeCall({ id: "call-c", customerName: "Third" }),
    ];

    repository.findCallsByCampaign.mockResolvedValue(calls);

    agentProvider.triggerCall
      .mockResolvedValueOnce({ success: true, externalId: "vf-a" })
      .mockResolvedValueOnce({ success: true, externalId: "vf-b" })
      .mockResolvedValueOnce({ success: true, externalId: "vf-c" });

    repository.updateCall.mockResolvedValue({} as any);
    repository.update.mockResolvedValue({
      id: campaignId,
      status: CampaignStatus.COMPLETED,
    } as any);

    await processCampaignCalls(
      { data: { campaignId, tenantId } },
      {
        repository: repository as any,
        agentProvider: agentProvider as any,
        sendEvent,
        tenantsService: tenantsService as any,
        encryptionService: encryptionService as any,
        masterKey,
      },
    );

    // Verify calls were processed in order (by checking the sequence of triggerCall args)
    const triggerArgs = agentProvider.triggerCall.mock.calls;
    expect(triggerArgs[0][0].name).toBe("First");
    expect(triggerArgs[1][0].name).toBe("Second");
    expect(triggerArgs[2][0].name).toBe("Third");
  });

  // ── Scenario 6: Provider failure doesn't block the queue ─────────────
  it("should continue processing after a provider throws (instead of resolving)", async () => {
    const calls = [
      makeCall({ id: "call-1", customerName: "Good" }),
      makeCall({ id: "call-2", customerName: "Bad" }),
      makeCall({ id: "call-3", customerName: "AlsoGood" }),
    ];

    repository.findCallsByCampaign.mockResolvedValue(calls);

    // Second call: provider throws (not just returns failure)
    agentProvider.triggerCall
      .mockResolvedValueOnce({ success: true, externalId: "vf-1" })
      .mockRejectedValueOnce(new Error("Network failure"))
      .mockResolvedValueOnce({ success: true, externalId: "vf-3" });

    repository.updateCall.mockResolvedValue({} as any);
    repository.update.mockResolvedValue({
      id: campaignId,
      status: CampaignStatus.COMPLETED,
    } as any);

    await processCampaignCalls(
      { data: { campaignId, tenantId } },
      {
        repository: repository as any,
        agentProvider: agentProvider as any,
        sendEvent,
        tenantsService: tenantsService as any,
        encryptionService: encryptionService as any,
        masterKey,
      },
    );

    // All 3 calls should still be "processed" (all updateCall calls made)
    expect(repository.updateCall).toHaveBeenCalledTimes(3);

    // The failed call should be marked as "failed"
    const failedCallUpdate = repository.updateCall.mock.calls.find(
      (call: any[]) => call[0] === "call-2",
    );
    expect(failedCallUpdate[1].status).toBe("failed");

    // Campaign should still complete with snapshot
    expect(repository.update).toHaveBeenCalledWith(
      campaignId,
      expect.objectContaining({
        status: CampaignStatus.COMPLETED,
        successfulCalls: 2,
        failedCalls: 1,
      }),
    );
  });
});
