import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { SupabaseAuthService } from "../infrastructure/providers/supabase-auth.service";
import { UnauthorizedException } from "@nestjs/common";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: jest.Mocked<SupabaseAuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      validateToken: jest.fn(),
      getUserProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: SupabaseAuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(SupabaseAuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should return session details on successful login", async () => {
      const credentials = { email: "test@test.com", password: "password123" };
      const mockSession = {
        access_token: "access-token",
        refresh_token: "refresh-token",
        user: { id: "user-id" },
      };

      authService.signIn.mockResolvedValue(mockSession as any);

      const mockResponse = { cookie: jest.fn() } as any;

      const result = await controller.login(credentials, mockResponse);

      expect(authService.signIn).toHaveBeenCalledWith(
        credentials.email,
        credentials.password,
      );
      expect(result).toEqual({
        user: { id: "user-id" },
      });
    });

    it("should bubble up exceptions from authService.signIn", async () => {
      const credentials = { email: "test@test.com", password: "wrong" };
      authService.signIn.mockRejectedValue(
        new UnauthorizedException("Invalid credentials"),
      );

      const mockResponse = { cookie: jest.fn() } as any;

      await expect(controller.login(credentials, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("register", () => {
    it("should return user details on successful registration", async () => {
      const credentials = { email: "new@test.com", password: "password123" };
      const mockUserResponse = { user: { id: "new-id" }, session: null };

      authService.signUp.mockResolvedValue(mockUserResponse as any);

      const mockResponse = { cookie: jest.fn() } as any;

      const result = await controller.register(credentials, mockResponse);

      expect(authService.signUp).toHaveBeenCalledWith(
        credentials.email,
        credentials.password,
      );
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe("logout", () => {
    it("should call authService.signOut and return success message", async () => {
      authService.signOut.mockResolvedValue(true);
      const mockRequest = { headers: { authorization: "Bearer valid-token" } };
      const mockResponse = { clearCookie: jest.fn() } as any;

      const result = await controller.logout(mockRequest, mockResponse);

      expect(authService.signOut).toHaveBeenCalledWith("valid-token");
      expect(mockResponse.clearCookie).toHaveBeenCalledWith("access_token");
      expect(result).toEqual({ message: "Logged out successfully" });
    });

    it("should return success even if token is missing (though guard would normally catch this)", async () => {
      const mockRequest = { headers: {} };
      const mockResponse = { clearCookie: jest.fn() } as any;

      const result = await controller.logout(mockRequest, mockResponse);

      expect(authService.signOut).not.toHaveBeenCalled();
      expect(mockResponse.clearCookie).toHaveBeenCalledWith("access_token");
      expect(result).toEqual({ message: "Logged out successfully" });
    });
  });
});
