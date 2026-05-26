import { ICampaignRepository } from "../domain/ports/campaign-repository.port";

export interface CampaignCompletedOrCancelledEvent {
  name: "campaign.completed" | "campaign.cancelled";
  data: {
    campaignId: string;
    tenantId: string;
  };
}

export interface CampaignPurgeDependencies {
  repository: Pick<ICampaignRepository, "redactCalls">;
}

export interface PurgeLogger {
  log(message: string): void;
}

/**
 * Pure function that redacts sensitive client data for a completed or
 * cancelled campaign.
 *
 * Extracted from the Inngest handler for testability.
 */
export async function purgeCampaignData(
  event: CampaignCompletedOrCancelledEvent,
  deps: CampaignPurgeDependencies,
  logger: PurgeLogger = console,
): Promise<void> {
  const { campaignId } = event.data;

  try {
    const redactedCount = await deps.repository.redactCalls(campaignId);
    logger.log(
      `[CampaignPurge] Redacted ${redactedCount} records for campaign ${campaignId}`,
    );
  } catch (error) {
    logger.log(
      `[CampaignPurge] Failed to redact campaign ${campaignId}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

import { Inngest } from "inngest";

/**
 * Creates the Inngest function that listens to campaign.completed and
 * campaign.cancelled events.
 */
export function createCampaignPurgeFunction(
  inngest: Inngest,
  deps: CampaignPurgeDependencies,
) {
  return inngest.createFunction(
    {
      id: "campaign-purge",
      name: "Campaign Data Purge",
    },
    { event: "campaign.completed" },
    async ({ event, step }) => {
      return step.run("purge-campaign-data", async () => {
        await purgeCampaignData(
          event as CampaignCompletedOrCancelledEvent,
          deps,
        );
      });
    },
  );
}
