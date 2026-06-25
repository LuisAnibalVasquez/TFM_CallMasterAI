import { Injectable } from "@nestjs/common";
import {
  IAgentProvider,
  CallResponse,
} from "../../domain/ports/agent-provider.port";
import { Client } from "../../domain/entities/client.entity";

@Injectable()
export class VoiceflowProvider implements IAgentProvider {
  async triggerCall(
    client: Client,
    config: { apiUrl: string; apiKey: string },
  ): Promise<CallResponse> {
    try {
      const payload = {
        to: client.phone,
        variables: {
          customer_name: client.name,
          customer_phone: client.phone,
          customer_age: String(client.age),
          customer_language: client.language,
        },
      };

      console.log(
        `[VoiceflowProvider] Triggering call for ${client.name} at ${client.phone} using ${config.apiUrl}`,
      );
      console.log(
        `[VoiceflowProvider] Request Payload:`,
        JSON.stringify(payload),
      );

      const response = await fetch(config.apiUrl, {
        method: "POST",
        headers: {
          Authorization: config.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorBody = "";
        try {
          errorBody = await response.text();
        } catch {
          // ignore
        }
        console.error(
          `[VoiceflowProvider] Voiceflow Error! Status: ${response.status}. Body: ${errorBody}`,
        );
        return {
          success: false,
          error: `Voiceflow API returned status ${response.status}: ${errorBody}`,
        };
      }

      let successBody = "";
      try {
        successBody = await response.text();
        console.log(
          `[VoiceflowProvider] Voiceflow Success! Response: ${successBody}`,
        );
      } catch {
        // ignore
      }

      return {
        success: true,
        externalId: `vf_${crypto.randomUUID()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
