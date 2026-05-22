import { Module } from "@nestjs/common";
import { Inngest } from "inngest";

/**
 * Provides the Inngest client singleton.
 *
 * Functions using this client are created in the parent CampaignsModule
 * where all dependencies (repository, agent provider) are available.
 */
@Module({
  providers: [
    {
      provide: "InngestClient",
      useFactory: () => {
        return new Inngest({
          id: "callmaster-ai",
          baseUrl: process.env.INNGEST_BASE_URL || "http://localhost:8288",
          eventKey: process.env.INNGEST_EVENT_KEY || "local-dev-key",
        });
      },
    },
  ],
  exports: ["InngestClient"],
})
export class CampaignsInngestModule {}
