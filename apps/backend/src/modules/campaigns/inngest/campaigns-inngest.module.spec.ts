import { Test, TestingModule } from "@nestjs/testing";
import { CampaignsInngestModule } from "./campaigns-inngest.module";

describe("CampaignsInngestModule", () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [CampaignsInngestModule],
    }).compile();
  });

  it("should be defined", () => {
    expect(moduleRef).toBeDefined();
  });

  it("should provide the InngestClient token", () => {
    const client = moduleRef.get("InngestClient");
    expect(client).toBeDefined();
    expect(typeof client.createFunction).toBe("function");
    expect(typeof client.send).toBe("function");
  });

  it("should export the InngestClient token", () => {
    const client = moduleRef.get("InngestClient");
    expect(client).toBeTruthy();
  });
});
