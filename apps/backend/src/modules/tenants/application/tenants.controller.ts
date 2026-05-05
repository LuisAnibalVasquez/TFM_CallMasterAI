import { Controller, Post, Body, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { TenantsService } from "../infrastructure/providers/tenants.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { AuthGuard } from "../../auth/infrastructure/guards/auth.guard";
import { RolesGuard } from "../../auth/infrastructure/guards/roles.guard";
import { Roles } from "../../auth/application/decorators/roles.decorator";
import { UserRole } from "@callmaster/shared";

@ApiTags("tenants")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("tenants")
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles(UserRole.PlatformOwner)
  @ApiOperation({ summary: "Create a new Tenant (PlatformOwner only)" })
  @ApiResponse({ status: 201, description: "Tenant successfully created" })
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.createTenant(createTenantDto);
  }

  @Get()
  @Roles(UserRole.PlatformOwner)
  @ApiOperation({ summary: "List all Tenants (PlatformOwner only)" })
  @ApiResponse({ status: 200, description: "List of tenants" })
  async getAllTenants() {
    return this.tenantsService.getAllTenants();
  }
}
