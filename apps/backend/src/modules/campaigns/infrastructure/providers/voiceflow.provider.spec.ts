import { VoiceflowProvider } from "./voiceflow.provider";
import { Client } from "../../domain/entities/client.entity";

describe("VoiceflowProvider", () => {
  let provider: VoiceflowProvider;

  const client = new Client("John Doe", "+14155552671", 30, "en");
  const config = {
    apiUrl: "https://api.voiceflow.com/v1/trigger",
    apiKey: "dm_test_key_123",
  };

  beforeEach(() => {
    provider = new VoiceflowProvider();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("triggerCall", () => {
    it("should POST to config.apiUrl and return success on 2xx response", async () => {
      const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        status: 200,
      } as Response);

      const result = await provider.triggerCall(client, config);

      expect(result.success).toBe(true);
      expect(result.externalId).toMatch(/^vf_/);

      expect(fetchSpy).toHaveBeenCalledWith(config.apiUrl, {
        method: "POST",
        headers: {
          Authorization: config.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: client.phone,
          variables: {
            customer_name: client.name,
            customer_phone: client.phone,
            customer_age: client.age,
            customer_language: client.language,
          },
        }),
      });
    });

    it("should return failure with status code on non-2xx response", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      const result = await provider.triggerCall(client, config);

      expect(result.success).toBe(false);
      expect(result.error).toContain("401");
    });

    it("should return failure with error message on network error", async () => {
      jest.spyOn(global, "fetch").mockRejectedValue(new Error("fetch failed"));

      const result = await provider.triggerCall(client, config);

      expect(result.success).toBe(false);
      expect(result.error).toBe("fetch failed");
    });
  });
});
