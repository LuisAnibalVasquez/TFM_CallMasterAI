import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { EncryptionService } from "./encryption.service";
import * as supabaseJs from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

describe("EncryptionService", () => {
  let service: EncryptionService;
  let supabaseAdminMock: any;

  const testMasterKey = "super-secret-master-key-256bit";
  const testPlaintext = "sk-voiceflow-api-key-abc123";
  const testEncryptedHex = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";

  beforeEach(async () => {
    supabaseAdminMock = {
      rpc: jest.fn(),
    };

    (supabaseJs.createClient as jest.Mock).mockReturnValue(supabaseAdminMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === "SUPABASE_URL") return "https://mock-url.supabase.co";
              if (key === "SERVICE_ROLE_KEY") return "mock-service-key";
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("encryptSecret", () => {
    it("should call supabase RPC encrypt_secret with plaintext and master key", async () => {
      supabaseAdminMock.rpc.mockResolvedValue({
        data: testEncryptedHex,
        error: null,
      });

      const result = await service.encryptSecret(testPlaintext, testMasterKey);

      expect(supabaseAdminMock.rpc).toHaveBeenCalledWith("encrypt_secret", {
        secret: testPlaintext,
        master_key: testMasterKey,
      });
      expect(result).toBe(testEncryptedHex);
    });

    it("should throw when supabase RPC returns an error", async () => {
      supabaseAdminMock.rpc.mockResolvedValue({
        data: null,
        error: { message: "RPC encryption error" },
      });

      await expect(
        service.encryptSecret(testPlaintext, testMasterKey),
      ).rejects.toThrow("Encryption failed: RPC encryption error");
    });
  });

  describe("decryptSecret", () => {
    it("should call supabase RPC decrypt_secret with encrypted hex and master key", async () => {
      supabaseAdminMock.rpc.mockResolvedValue({
        data: testPlaintext,
        error: null,
      });

      const result = await service.decryptSecret(
        testEncryptedHex,
        testMasterKey,
      );

      expect(supabaseAdminMock.rpc).toHaveBeenCalledWith("decrypt_secret", {
        encrypted_text: testEncryptedHex,
        master_key: testMasterKey,
      });
      expect(result).toBe(testPlaintext);
    });

    it("should throw when supabase RPC returns an error", async () => {
      supabaseAdminMock.rpc.mockResolvedValue({
        data: null,
        error: { message: "RPC decryption error" },
      });

      await expect(
        service.decryptSecret(testEncryptedHex, testMasterKey),
      ).rejects.toThrow("Decryption failed: RPC decryption error");
    });
  });

  describe("encrypt-decrypt roundtrip", () => {
    it("should produce ciphertext that decrypts back to the original plaintext", async () => {
      // encrypt
      supabaseAdminMock.rpc.mockResolvedValueOnce({
        data: testEncryptedHex,
        error: null,
      });
      // decrypt
      supabaseAdminMock.rpc.mockResolvedValueOnce({
        data: testPlaintext,
        error: null,
      });

      const encrypted = await service.encryptSecret(
        testPlaintext,
        testMasterKey,
      );
      const decrypted = await service.decryptSecret(encrypted, testMasterKey);

      expect(decrypted).toBe(testPlaintext);
      expect(supabaseAdminMock.rpc).toHaveBeenCalledTimes(2);
    });
  });
});
