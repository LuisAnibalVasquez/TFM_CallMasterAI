import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { SupabaseAuthService } from "../infrastructure/providers/supabase-auth.service";
import { AuthCredentialsDto, AuthResponseDto } from "./dto/auth.dto";
import { AuthGuard } from "../infrastructure/guards/auth.guard";

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

    // Set HttpOnly cookies
    const isProduction = process.env.NODE_ENV === "production";
    response.cookie("access_token", session.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 3600 * 1000, // 1 hour
    });
    response.cookie("refresh_token", session.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 3600 * 1000, // 7 days
    });

    return {
      user: session.user,
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
  async register(@Body() credentials: AuthCredentialsDto) {
    return this.authService.signUp(credentials.email, credentials.password);
  }

  @Post("logout")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Log out user and invalidate session" })
  @ApiResponse({ status: 200, description: "Successfully logged out" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async logout(
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Check both cookie and header
    const token =
      request.cookies?.["access_token"] ||
      request.headers.authorization?.split(" ")[1];

    if (token) {
      await this.authService.signOut(token);
    }

    // Clear cookies
    response.clearCookie("access_token");
    response.clearCookie("refresh_token");

    return { message: "Logged out successfully" };
  }
}
