import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface IEncryptionService {
  encryptSecret(plaintext: string, masterKey: string): Promise<string>;
  decryptSecret(encryptedHex: string, masterKey: string): Promise<string>;
}

@Injectable()
export class EncryptionService implements IEncryptionService {
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

  async encryptSecret(plaintext: string, masterKey: string): Promise<string> {
    const { data, error } = await this.supabaseAdmin.rpc("encrypt_secret", {
      secret: plaintext,
      master_key: masterKey,
    });

    if (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }

    return data as string;
  }

  async decryptSecret(
    encryptedHex: string,
    masterKey: string,
  ): Promise<string> {
    const { data, error } = await this.supabaseAdmin.rpc("decrypt_secret", {
      encrypted_text: encryptedHex,
      master_key: masterKey,
    });

    if (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }

    return data as string;
  }
}
