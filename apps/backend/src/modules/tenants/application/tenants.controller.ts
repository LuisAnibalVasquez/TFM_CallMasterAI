import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { TenantsService } from "../infrastructure/providers/tenants.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpdateTenantDto } from "./dto/update-tenant.dto";
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
  @ApiResponse({ status: 201, description: "Tenant and admin user created" })
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.createTenant(createTenantDto);
  }

  @Get()
  @Roles(UserRole.PlatformOwner)
  @ApiOperation({ summary: "List all Tenants (PlatformOwner only)" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: "Paginated list of tenants" })
  async getAllTenants(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.tenantsService.getAllTenants(page || 1, limit || 20);
  }

  @Put(":id")
  @Roles(UserRole.PlatformOwner)
  @ApiOperation({
    summary: "Update a Tenant (PlatformOwner only)",
    description:
      "Update tenant details, configuration, or toggle status. Only provided fields are updated.",
  })
  @ApiResponse({ status: 200, description: "Tenant updated successfully" })
  @ApiResponse({ status: 404, description: "Tenant not found" })
  async updateTenant(
    @Param("id") id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantsService.updateTenant(id, updateTenantDto);
  }

  @Delete(":id")
  @Roles(UserRole.PlatformOwner)
  @ApiOperation({
    summary: "Delete a Tenant (PlatformOwner only)",
    description:
      "Deletes the tenant and all associated users. Rejected if the tenant has campaigns.",
  })
  @ApiResponse({ status: 200, description: "Tenant deleted successfully" })
  @ApiResponse({
    status: 409,
    description: "Cannot delete tenant with campaigns",
  })
  @ApiResponse({ status: 404, description: "Tenant not found" })
  async deleteTenant(@Param("id") id: string) {
    return this.tenantsService.deleteTenant(id);
  }
}
