import { CampaignStatus } from "@callmaster/shared";
import { ICampaignRepository } from "../domain/ports/campaign-repository.port";
import {
  IAgentProvider,
  CallResponse,
} from "../domain/ports/agent-provider.port";
import { Client } from "../domain/entities/client.entity";

export interface CampaignStartedEvent {
  data: {
    campaignId: string;
    tenantId: string;
  };
}

export interface CampaignProcessingDependencies {
  repository: Pick<
    ICampaignRepository,
    "findCallsByCampaign" | "updateCall" | "update" | "findById"
  >;
  agentProvider: IAgentProvider;
  sendEvent: (event: {
    name: string;
    data: Record<string, unknown>;
  }) => Promise<unknown>;
}

/**
 * Pure function that processes all calls for a campaign sequentially.
 *
 * This is extracted from the Inngest handler so it can be unit tested
 * without Inngest infrastructure.
 */
export async function processCampaignCalls(
  event: CampaignStartedEvent,
  deps: CampaignProcessingDependencies,
): Promise<void> {
  const { campaignId, tenantId } = event.data;
  const { repository, agentProvider, sendEvent } = deps;

  // Fetch all pending calls for this campaign
  const calls = await repository.findCallsByCampaign(campaignId);

  let successfulCalls = 0;
  let failedCalls = 0;
  let totalCost = 0;

  // Process each call sequentially
  for (const call of calls) {
    const client = new Client(
      call.customerName,
      call.phoneEncrypted,
      call.age,
      call.language,
    );

    const config = {
      apiUrl: process.env.VOICEFLOW_API_URL || "https://api.voiceflow.com",
      apiKey: process.env.VOICEFLOW_API_KEY || "",
    };

    let response: CallResponse;
    try {
      response = await agentProvider.triggerCall(client, config);
    } catch {
      response = { success: false, error: "Provider invocation failed" };
    }

    if (response.success) {
      successfulCalls++;
      const callCost = 1.5; // fixed base cost per call
      totalCost += callCost;

      await repository.updateCall(call.id, {
        status: "completed",
        duration: call.duration, // Voiceflow returns duration
        cost: callCost,
        voiceflowTranscriptId: response.externalId,
      });
    } else {
      failedCalls++;
      await repository.updateCall(call.id, {
        status: "failed",
      });
    }
  }

  // Compute and persist snapshot
  await repository.update(campaignId, {
    status: CampaignStatus.COMPLETED,
    totalCalls: calls.length,
    successfulCalls,
    failedCalls,
    totalCost: Math.round(totalCost * 100) / 100,
  });

  // Emit campaign.completed to trigger purge
  await sendEvent({
    name: "campaign.completed",
    data: { campaignId, tenantId },
  });
}

import { Inngest } from "inngest";

/**
 * Creates the Inngest function that listens to campaign.started events
 * and delegates to processCampaignCalls with NestJS-injected dependencies.
 */
export function createCampaignProcessingFunction(
  inngest: Inngest,
  deps: CampaignProcessingDependencies,
) {
  return inngest.createFunction(
    {
      id: "campaign-processing",
      name: "Campaign Call Processing",
      concurrency: 1,
    },
    { event: "campaign.started" },
    async ({ event, step }) => {
      return step.run("process-campaign-calls", async () => {
        await processCampaignCalls(event as CampaignStartedEvent, deps);
      });
    },
  );
}
