import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
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
  async login(@Body() credentials: AuthCredentialsDto) {
    const session = await this.authService.signIn(
      credentials.email,
      credentials.password,
    );
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
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
}
