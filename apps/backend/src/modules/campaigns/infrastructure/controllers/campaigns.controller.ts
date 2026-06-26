// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Inject,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";
import { UserRole } from "@callmaster/shared";
import { AuthGuard } from "../../../auth/infrastructure/guards/auth.guard";
import { RolesGuard } from "../../../auth/infrastructure/guards/roles.guard";
import { Roles } from "../../../auth/application/decorators/roles.decorator";
import { AllowOverride } from "../../../auth/application/decorators/allow-override.decorator";
import { CreateCampaignDto } from "../../application/dto/create-campaign.dto";
import { CreateCampaignUseCase } from "../../application/use-cases/create-campaign.use-case";
import { ListCampaignsUseCase } from "../../application/use-cases/list-campaigns.use-case";
import { StartCampaignUseCase } from "../../application/use-cases/start-campaign.use-case";
import { CancelCampaignUseCase } from "../../application/use-cases/cancel-campaign.use-case";
import { DeleteCampaignUseCase } from "../../application/use-cases/delete-campaign.use-case";
import { ICampaignRepository } from "../../domain/ports/campaign-repository.port";

@ApiTags("campaigns")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("campaigns")
export class CampaignsController {
  constructor(
    private readonly createCampaignUseCase: CreateCampaignUseCase,
    private readonly listCampaignsUseCase: ListCampaignsUseCase,
    private readonly startCampaignUseCase: StartCampaignUseCase,
    private readonly cancelCampaignUseCase: CancelCampaignUseCase,
    private readonly deleteCampaignUseCase: DeleteCampaignUseCase,
    @Inject("ICampaignRepository")
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  @Post()
  @Roles(UserRole.TenantAdmin)
  @AllowOverride()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new campaign with CSV data" })
  @ApiResponse({
    status: 201,
    description: "Campaign and call records created",
  })
  @ApiResponse({ status: 400, description: "CSV validation failed" })
  async create(
    @Request() req: any,
    @Body() createCampaignDto: CreateCampaignDto,
  ) {
    return this.createCampaignUseCase.execute({
      tenantId: req.user.tenantId,
      name: createCampaignDto.name,
      environment: createCampaignDto.environment,
      csvContent: createCampaignDto.csvContent,
    });
  }

  @Get()
  @Roles(UserRole.TenantAdmin)
  @AllowOverride()
  @ApiOperation({ summary: "List campaigns for the authenticated tenant" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: "Paginated list of campaigns" })
  async findAll(
    @Request() req: any,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.listCampaignsUseCase.execute(req.user.tenantId, {
      page: page || 1,
      limit: limit || 20,
    });
  }

  @Post(":id/start")
  @Roles(UserRole.TenantAdmin)
  @AllowOverride()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Start a campaign (change status to In-Progress)" })
  @ApiParam({ name: "id", description: "Campaign ID" })
  @ApiResponse({ status: 200, description: "Campaign started" })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  @ApiResponse({ status: 404, description: "Campaign not found" })
  async start(@Request() req: any, @Param("id") id: string) {
    return this.startCampaignUseCase.execute({
      campaignId: id,
      tenantId: req.user.tenantId,
    });
  }

  @Post(":id/cancel")
  @Roles(UserRole.TenantAdmin)
  @AllowOverride()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel a campaign (change status to Cancelled)" })
  @ApiParam({ name: "id", description: "Campaign ID" })
  @ApiResponse({ status: 200, description: "Campaign cancelled" })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  @ApiResponse({ status: 404, description: "Campaign not found" })
  async cancel(@Request() req: any, @Param("id") id: string) {
    return this.cancelCampaignUseCase.execute({
      campaignId: id,
      tenantId: req.user.tenantId,
    });
  }

  @Delete(":id")
  @Roles(UserRole.TenantAdmin)
  @AllowOverride()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      "Delete a campaign (only allowed for Created or In-Progress campaigns)",
  })
  @ApiParam({ name: "id", description: "Campaign ID" })
  @ApiResponse({ status: 204, description: "Campaign deleted" })
  @ApiResponse({
    status: 400,
    description: "Cannot delete a completed or cancelled campaign",
  })
  @ApiResponse({ status: 404, description: "Campaign not found" })
  async delete(@Request() req: any, @Param("id") id: string): Promise<void> {
    return this.deleteCampaignUseCase.execute({
      campaignId: id,
      tenantId: req.user.tenantId,
    });
  }

  @Get("template")
  @Roles(UserRole.TenantAdmin)
  @AllowOverride()
  @ApiOperation({
    summary: "Get a presigned URL for downloading the CSV template",
  })
  @ApiResponse({ status: 200, description: "Presigned URL" })
  async downloadTemplate() {
    const url = await this.campaignRepository.getTemplateDownloadUrl();
    return { url };
  }
}
