import { Tenant } from "./tenant.entity";
import { TenantStatus } from "@callmaster/shared";

describe("Tenant entity", () => {
  const baseProps = {
    id: "tenant-1",
    name: "Acme Corp",
    phone: "+1234567890",
    contactEmail: "admin@acme.com",
    contactPerson: "John Doe",
    status: TenantStatus.ACTIVE,
    campaignCount: 0,
    sandboxConfig: { apiUrl: "https://sandbox.api.com", encryptedKey: "enc1" },
    productionConfig: { apiUrl: "https://api.com", encryptedKey: "enc2" },
  };

  describe("campaignCount", () => {
    it("should store campaignCount from constructor props", () => {
      const tenant = new Tenant({ ...baseProps, campaignCount: 5 });
      expect(tenant.campaignCount).toBe(5);
    });

    it("should store zero campaignCount from constructor props", () => {
      const tenant = new Tenant({ ...baseProps, campaignCount: 0 });
      expect(tenant.campaignCount).toBe(0);
    });
  });

  describe("canBeDeleted", () => {
    it("should return true when campaignCount is 0", () => {
      const tenant = new Tenant(baseProps);
      expect(tenant.canBeDeleted(0)).toBe(true);
    });

    it("should return false when campaignCount is greater than 0", () => {
      const tenant = new Tenant(baseProps);
      expect(tenant.canBeDeleted(5)).toBe(false);
    });

    it("should return false when campaignCount is 1", () => {
      const tenant = new Tenant(baseProps);
      expect(tenant.canBeDeleted(1)).toBe(false);
    });
  });
});
