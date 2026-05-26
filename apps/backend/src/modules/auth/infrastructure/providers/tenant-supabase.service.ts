// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { Injectable, Scope, Inject } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Request } from "express";

/**
 * Request-scoped Supabase client that propagates the user's JWT
 * so that RLS policies can enforce tenant isolation.
 *
 * Each HTTP request gets its own client instance with the user's
 * Authorization header forwarded to Supabase.
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantSupabaseService {
  private cachedClient: SupabaseClient | null = null;

  constructor(
    @Inject(REQUEST) private request: Request,
    private configService: ConfigService,
  ) {}

  /**
   * Returns a Supabase client scoped to the current user's JWT.
   * The client is created once per request and cached.
   */
  getClient(): SupabaseClient {
    if (this.cachedClient) {
      return this.cachedClient;
    }

    const supabaseUrl = this.configService.get<string>("SUPABASE_URL") || "";
    const anonKey = this.configService.get<string>("SUPABASE_ANON_KEY") || "";

    // Extract the JWT from the Authorization header or cookies
    const authHeader = this.request.headers.authorization;
    const cookieToken = this.request.cookies?.["access_token"];

    const token =
      cookieToken ||
      (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

    this.cachedClient = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {},
    });

    return this.cachedClient;
  }
}
