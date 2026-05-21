import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { AuthGuard } from "../../../auth/infrastructure/guards/auth.guard";
import { RolesGuard } from "../../../auth/infrastructure/guards/roles.guard";
import { CreateCampaignDto } from "../../application/dto/create-campaign.dto";
import { CreateCampaignUseCase } from "../../application/use-cases/create-campaign.use-case";
import { ListCampaignsUseCase } from "../../application/use-cases/list-campaigns.use-case";

@ApiTags("campaigns")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("campaigns")
export class CampaignsController {
  constructor(
    private readonly createCampaignUseCase: CreateCampaignUseCase,
    private readonly listCampaignsUseCase: ListCampaignsUseCase,
  ) {}

  @Post()
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
}
