import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { UserRole } from "@callmaster/shared";
import { AuthGuard } from "../../../auth/infrastructure/guards/auth.guard";
import { RolesGuard } from "../../../auth/infrastructure/guards/roles.guard";
import { Roles } from "../../../auth/application/decorators/roles.decorator";
import { AllowOverride } from "../../../auth/application/decorators/allow-override.decorator";
import { AnalyticsService } from "../providers/analytics.service";

@ApiTags("analytics")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("tenant-summary")
  @Roles(UserRole.TenantAdmin)
  @AllowOverride()
  @ApiOperation({
    summary: "Get tenant analytics summary (KPIs + hourly call trends)",
  })
  @ApiResponse({
    status: 200,
    description: "Tenant summary with KPIs and call trend data",
  })
  async getTenantSummary() {
    return this.analyticsService.getTenantSummary();
  }
}
