import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTenantDto {
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

  @ApiProperty({ example: "+1234567890", description: "Contact phone number" })
  @IsString()
  @IsOptional()
  phone?: string;
}
