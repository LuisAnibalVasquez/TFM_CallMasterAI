import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { TenantStatus } from "@callmaster/shared";
import { AIConfigDto } from "./create-tenant.dto";

export class UpdateTenantDto {
  @ApiPropertyOptional({
    enum: TenantStatus,
    example: TenantStatus.SUSPENDED,
    description: "Toggle tenant status between active and suspended",
  })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @ApiPropertyOptional({
    example: "Acme Corp International",
    description: "Updated company name",
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: "+1234567890",
    description: "Updated contact phone number",
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: "newadmin@acmecorp.com",
    description: "Updated contact email",
  })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({
    example: "Jane Doe",
    description: "Updated primary contact person name",
  })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional({
    example: "https://acmecorp.com/new-logo.png",
    description: "Updated company logo URL",
  })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: "Updated sandbox AI agent configuration",
  })
  @ValidateNested()
  @Type(() => AIConfigDto)
  @IsOptional()
  sandboxConfig?: AIConfigDto;

  @ApiPropertyOptional({
    description: "Updated production AI agent configuration",
  })
  @ValidateNested()
  @Type(() => AIConfigDto)
  @IsOptional()
  productionConfig?: AIConfigDto;
}
