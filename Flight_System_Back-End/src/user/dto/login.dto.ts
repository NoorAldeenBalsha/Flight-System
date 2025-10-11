import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({description: 'The email of the user',example: 'user@example.com',})
  @IsString() // Minimum required decorator
  email: string;
  //============================================================================
  @ApiProperty({description: 'The password of the user',example: 'Password@123',})
  @IsString() // Minimum required decorator
  password: string;
  //============================================================================
  @ApiProperty({description:'Google reCAPTCHA token'})
  @IsNotEmpty({message : 'RECAPTCHA_REQUIRED'})
  @IsString()
  recaptchaToken:string;
  //============================================================================
}