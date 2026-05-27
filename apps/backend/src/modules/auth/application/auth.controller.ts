import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { SupabaseAuthService } from "../infrastructure/providers/supabase-auth.service";
import { AuthCredentialsDto, AuthResponseDto } from "./dto/auth.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: SupabaseAuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Log in with email and password" })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiResponse({
    status: 200,
    description: "Successful login",
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(
    @Body() credentials: AuthCredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.signIn(
      credentials.email,
      credentials.password,
    );

    // Fetch custom profile to get the role
    const profile = await this.authService.getUserProfile(session.user.id);

    // Set HttpOnly cookies
    const isProduction = process.env.NODE_ENV === "production";
    response.cookie("access_token", session.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 3600 * 1000, // 1 hour
    });
    response.cookie("refresh_token", session.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 3600 * 1000, // 7 days
    });

    return {
      user: {
        ...session.user,
        role: profile.role,
      },
    };
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({
    status: 400,
    description: "Bad request or registration failed",
  })
  async register(
    @Body() credentials: AuthCredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, session } = await this.authService.signUp(
      credentials.email,
      credentials.password,
    );

    if (session) {
      // Set HttpOnly cookies
      const isProduction = process.env.NODE_ENV === "production";
      response.cookie("access_token", session.access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 3600 * 1000, // 1 hour
      });
      response.cookie("refresh_token", session.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 7 * 24 * 3600 * 1000, // 7 days
      });
    }

    return { user };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Log out user and invalidate session" })
  @ApiResponse({ status: 200, description: "Successfully logged out" })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Check both cookie and header
    const token =
      request.cookies?.["access_token"] ??
      (request.headers.authorization?.startsWith("Bearer ")
        ? request.headers.authorization.split(" ")[1]
        : undefined);

    try {
      if (token) {
        await this.authService.signOut(token);
      }
    } finally {
      // Clear cookies
      response.clearCookie("access_token");
      response.clearCookie("refresh_token");
    }

    return { message: "Logged out successfully" };
  }
}
