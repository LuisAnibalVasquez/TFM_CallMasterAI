import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UserRole } from "@callmaster/shared";

@Injectable()
export class SupabaseAuthService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseKey = this.configService.get<string>("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase URL or Key is missing. Check your .env file.");
    }

    this.supabase = createClient(supabaseUrl || "", supabaseKey || "");
  }

  async validateToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    return data.user;
  }

  async getUserProfile(userId: string) {
    // Buscar el perfil y el rol asociado
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*, role:roles(name)")
      .eq("id", userId)
      .single();

    if (error || !data) {
      throw new UnauthorizedException("User profile not found");
    }

    return {
      ...data,
      role: data.role?.name as UserRole,
    };
  }

  getSupabaseClient() {
    return this.supabase;
  }
}
