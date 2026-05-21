import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CreateTenantInput } from "@callmaster/shared";

export class AIConfigDto {
  @ApiProperty({
    example: "https://api.voiceflow.com",
    description: "AI provider API base URL for this environment",
  })
  @IsUrl()
  @IsNotEmpty()
  apiUrl!: string;

  @ApiProperty({
    example: "sk-voiceflow-key-abc123",
    description:
      "AI provider API key in plaintext. Will be encrypted before storage.",
  })
  @IsString()
  @IsNotEmpty()
  apiKey!: string;
}

export class CreateTenantDto implements CreateTenantInput {
  @ApiProperty({
    example: "Acme Corp",
    description: "Name of the Tenant company",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: "admin@acmecorp.com",
    description: "Contact email (will be used as admin login)",
  })
  @IsEmail()
  @IsNotEmpty()
  contactEmail!: string;

  @ApiPropertyOptional({
    example: "+1234567890",
    description: "Contact phone number",
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: "John Doe",
    description: "Name of the primary contact person at the tenant company",
  })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional({
    example: "https://acmecorp.com/logo.png",
    description: "URL to the company logo",
  })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({
    description: "Sandbox AI agent configuration (development/testing)",
  })
  @ValidateNested()
  @Type(() => AIConfigDto)
  @IsNotEmpty()
  sandboxConfig!: AIConfigDto;

  @ApiProperty({
    description: "Production AI agent configuration (live environment)",
  })
  @ValidateNested()
  @Type(() => AIConfigDto)
  @IsNotEmpty()
  productionConfig!: AIConfigDto;
}
