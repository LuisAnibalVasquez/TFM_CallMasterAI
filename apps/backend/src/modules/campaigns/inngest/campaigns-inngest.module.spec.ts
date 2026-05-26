// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { CampaignsInngestModule } from "./campaigns-inngest.module";

describe("CampaignsInngestModule", () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CampaignsInngestModule,
      ],
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
