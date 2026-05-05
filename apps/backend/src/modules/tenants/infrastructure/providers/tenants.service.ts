import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { CreateTenantDto } from "../../application/dto/create-tenant.dto";
import * as crypto from "crypto";

@Injectable()
export class TenantsService {
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const serviceRoleKey = this.configService.get<string>("SERVICE_ROLE_KEY");

    this.supabaseAdmin = createClient(supabaseUrl || "", serviceRoleKey || "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async createTenant(dto: CreateTenantDto) {
    // 1. Insert the tenant into `tenants` table
    const { data: tenant, error: tenantError } = await this.supabaseAdmin
      .from("tenants")
      .insert({
        name: dto.name,
        contact_email: dto.contactEmail,
        phone: dto.phone,
      })
      .select()
      .single();

    if (tenantError) {
      throw new InternalServerErrorException(
        `Failed to create tenant: ${tenantError.message}`,
      );
    }

    // 2. Generate a secure temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex") + "A1!";

    // 3. Create the admin user for this tenant in Supabase Auth
    const { data: authData, error: authError } =
      await this.supabaseAdmin.auth.admin.createUser({
        email: dto.contactEmail,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError) {
      // Rollback tenant creation
      await this.supabaseAdmin.from("tenants").delete().eq("id", tenant.id);
      throw new InternalServerErrorException(
        `Failed to create tenant admin user: ${authError.message}`,
      );
    }

    // 4. Wait a bit for the trigger `handle_new_user` to create the profile
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 5. Update the profile with the tenant_id
    const { error: profileError } = await this.supabaseAdmin
      .from("profiles")
      .update({ tenant_id: tenant.id })
      .eq("id", authData.user.id);

    if (profileError) {
      throw new InternalServerErrorException(
        `Failed to link admin user to tenant: ${profileError.message}`,
      );
    }

    return {
      tenant,
      adminCredentials: {
        email: dto.contactEmail,
        temporaryPassword: tempPassword,
      },
    };
  }

  async getAllTenants() {
    const { data, error } = await this.supabaseAdmin
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch tenants: ${error.message}`,
      );
    }

    return data;
  }
}
