import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { CreateTenantDto } from "../../application/dto/create-tenant.dto";
import { UpdateTenantDto } from "../../application/dto/update-tenant.dto";
import { CreateTenantUseCase } from "../../application/use-cases/create-tenant.use-case";
import { DeleteTenantUseCase } from "../../application/use-cases/delete-tenant.use-case";
import { UpdateTenantUseCase } from "../../application/use-cases/update-tenant.use-case";
import { ListTenantsUseCase } from "../../application/use-cases/list-tenants.use-case";
import { Tenant } from "../../domain/entities/tenant.entity";
import { ITenantRepository } from "../../domain/ports/tenant-repository.port";

@Injectable()
export class TenantsService implements ITenantRepository {
  private supabaseAdmin: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private createTenantUseCase: CreateTenantUseCase,
    private deleteTenantUseCase: DeleteTenantUseCase,
    private updateTenantUseCase: UpdateTenantUseCase,
    private listTenantsUseCase: ListTenantsUseCase,
  ) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const serviceRoleKey = this.configService.get<string>("SERVICE_ROLE_KEY");

    this.supabaseAdmin = createClient(supabaseUrl || "", serviceRoleKey || "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // ─── Public API (called by controller) ───────────────────────────────

  async createTenant(dto: CreateTenantDto) {
    return this.createTenantUseCase.execute(dto);
  }

  async getAllTenants(page = 1, limit = 20) {
    return this.listTenantsUseCase.execute(page, limit);
  }

  async updateTenant(tenantId: string, dto: UpdateTenantDto) {
    return this.updateTenantUseCase.execute(tenantId, dto);
  }

  async deleteTenant(tenantId: string) {
    return this.deleteTenantUseCase.execute(tenantId);
  }

  // ─── ITenantRepository implementation ────────────────────────────────

  async create(tenant: Tenant): Promise<Tenant> {
    const { data, error } = await this.supabaseAdmin
      .from("tenants")
      .insert({
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        contact_email: tenant.contactEmail,
        logo_url: tenant.logoUrl,
        status: tenant.status,
        sandbox_config: tenant.sandboxConfig,
        production_config: tenant.productionConfig,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to create tenant: ${error.message}`,
      );
    }

    return this.mapToTenant(data);
  }

  async findById(id: string): Promise<Tenant | null> {
    const { data, error } = await this.supabaseAdmin
      .from("tenants")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToTenant(data);
  }

  async findAll(options: {
    page: number;
    limit: number;
  }): Promise<{ data: Tenant[]; total: number }> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabaseAdmin
      .from("tenants")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch tenants: ${error.message}`,
      );
    }

    return {
      data: (data || []).map(this.mapToTenant),
      total: count || 0,
    };
  }

  async update(id: string, delta: Partial<Tenant>): Promise<Tenant> {
    const updatePayload: Record<string, unknown> = {};

    if (delta.name !== undefined) updatePayload.name = delta.name;
    if (delta.phone !== undefined) updatePayload.phone = delta.phone;
    if (delta.contactEmail !== undefined)
      updatePayload.contact_email = delta.contactEmail;
    if (delta.logoUrl !== undefined) updatePayload.logo_url = delta.logoUrl;
    if (delta.status !== undefined) updatePayload.status = delta.status;
    if (delta.sandboxConfig !== undefined)
      updatePayload.sandbox_config = delta.sandboxConfig;
    if (delta.productionConfig !== undefined)
      updatePayload.production_config = delta.productionConfig;

    const { data, error } = await this.supabaseAdmin
      .from("tenants")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(
        `Failed to update tenant: ${error?.message || "Tenant not found"}`,
      );
    }

    return this.mapToTenant(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from("tenants")
      .delete()
      .eq("id", id);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to delete tenant: ${error.message}`,
      );
    }
  }

  async countCampaigns(tenantId: string): Promise<number> {
    const { count, error } = await this.supabaseAdmin
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to count campaigns: ${error.message}`,
      );
    }

    return count || 0;
  }

  async createAdminUser(
    email: string,
    password: string,
  ): Promise<{ userId: string }> {
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error || !data.user) {
      throw new InternalServerErrorException(
        `Failed to create admin user: ${error?.message || "Unknown auth error"}`,
      );
    }

    return { userId: data.user.id };
  }

  async linkUserToTenant(userId: string, tenantId: string): Promise<void> {
    // Wait briefly for the DB trigger (handle_new_user) to create the profile row
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { error } = await this.supabaseAdmin
      .from("profiles")
      .update({ tenant_id: tenantId })
      .eq("id", userId);

    if (error) {
      // Attempt to rollback: delete the tenant we just created
      throw new InternalServerErrorException(
        `Failed to link admin user to tenant: ${error.message}`,
      );
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────

  private mapToTenant(row: any): Tenant {
    return new Tenant({
      id: row.id,
      name: row.name,
      phone: row.phone || "",
      contactEmail: row.contact_email,
      contactPerson: row.contact_person,
      logoUrl: row.logo_url,
      status: row.status,
      sandboxConfig: row.sandbox_config as any,
      productionConfig: row.production_config as any,
    });
  }
}
