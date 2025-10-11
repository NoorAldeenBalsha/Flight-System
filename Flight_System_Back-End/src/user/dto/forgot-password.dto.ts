import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, isString, IsString, Matches, MaxLength } from "class-validator";

export class ForgotPasswordDto {
    @IsNotEmpty({message: 'User Email is required'})
    @IsString({message:'User Email must be a string'})
    @IsEmail({},{message:'User Email must be a valid email'})
    @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/ ,{message:'User Email must be a valid email'})
    email:string;
    //============================================================================
    @ApiProperty({description:'Google reCAPTCHA token'})
    @IsNotEmpty({message : 'RECAPTCHA_REQUIRED'})
    @IsString()
    recaptchaToken:string;
    //============================================================================
}