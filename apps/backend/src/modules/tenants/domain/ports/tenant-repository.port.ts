import { Tenant } from "../entities/tenant.entity";

export interface ITenantRepository {
  create(tenant: Tenant): Promise<Tenant>;
  findById(id: string): Promise<Tenant | null>;
  findAll(options: {
    page: number;
    limit: number;
  }): Promise<{ data: Tenant[]; total: number }>;
  update(id: string, tenant: Partial<Tenant>): Promise<Tenant>;
  delete(id: string): Promise<void>;
  countCampaigns(tenantId: string): Promise<number>;
  createAdminUser(email: string, password: string): Promise<{ userId: string }>;
  linkUserToTenant(userId: string, tenantId: string): Promise<void>;
}
