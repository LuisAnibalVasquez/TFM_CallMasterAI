import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class AuthCredentialsDto {
  @ApiProperty({
    example: "admin@callmaster.ai",
    description: "The email address of the user",
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: "P@ssw0rd123",
    description: "The password of the user",
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "JWT Access Token",
  })
  access_token!: string;

  @ApiProperty({
    description: "JWT Refresh Token",
  })
  refresh_token!: string;

  @ApiProperty({
    description: "User details",
  })
  user!: any;
}
