import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from "@nestjs/common";
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

  @Post("logout")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Log out user and invalidate session" })
  @ApiResponse({ status: 200, description: "Successfully logged out" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async logout(@Req() request: any) {
    const token = request.headers.authorization?.split(" ")[1];
    if (token) {
      await this.authService.signOut(token);
    }
    return { message: "Logged out successfully" };
  }
}
