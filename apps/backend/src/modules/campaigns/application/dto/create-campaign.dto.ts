import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsIn } from "class-validator";

export class CreateCampaignDto {
  @ApiProperty({
    example: "Q1 Outreach",
    description: "Campaign name",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: "Sandbox",
    description: "Execution environment",
    enum: ["Sandbox", "Production"],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(["Sandbox", "Production"])
  environment!: string;

  @ApiProperty({
    example:
      "Customer Name,Phone Number,Age,Preferred Language\nJohn Doe,+14155552671,30,English",
    description: "Raw CSV content with header and data rows",
  })
  @IsString()
  @IsNotEmpty()
  csvContent!: string;
}
