import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Singleton Supabase client that uses the SERVICE_ROLE_KEY to bypass RLS.
 *
 * Unlike TenantSupabaseService (request-scoped, user JWT), this client
 * has full database access and is used by PlatformOwner-only analytics
 * endpoints to aggregate data across all tenants.
 */
@Injectable()
export class AdminSupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL") || "";
    const serviceRoleKey =
      this.configService.get<string>("SERVICE_ROLE_KEY") || "";

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Returns the service-role Supabase client.
   * Queries made with this client bypass Row-Level Security.
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
