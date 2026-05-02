import { Client } from "../entities/client.entity";

export interface CallResponse {
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface IAgentProvider {
  triggerCall(
    client: Client,
    config: { apiUrl: string; apiKey: string },
  ): Promise<CallResponse>;
}
