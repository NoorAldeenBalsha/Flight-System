import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsEmail, MinLength, IsOptional, IsEnum, IsNotEmpty, MaxLength, Matches, Length } from 'class-validator';
import { UserGender, UserRole } from 'utilitis/enums';

export class RegisterUserDto{
  @ApiProperty({ description: 'Name of the user', example: 'Noor Aldeen Balsha' })
  @IsString()
  @MinLength(3)
  fullName: string;
  //============================================================================
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;
  //============================================================================
  @ApiProperty({ description: 'Password for the user', example: 'Password@123' })
  @IsNotEmpty({message: ' Password is required'})
  @MaxLength(250)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { 
        message: ' Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'})
  @IsString({message:' Password must be a string'})
  @Length(8, 250, {message: ' Password must be at least 8 characters long and contaions small and capital letters and numbers and special characters'})
  password: string;
  //============================================================================
  @ApiProperty({ description: 'User role', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
  //============================================================================
  @ApiProperty({ description: 'Date of birth', required: false })
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : value)
  dateOfBirth?: Date;  
  //============================================================================
  @ApiProperty({ description: 'User gender', enum: UserGender, required: false })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;  
  //============================================================================
  @ApiProperty({ description: 'Phone', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
  //============================================================================
  @ApiProperty({ description: 'Passport Number', required: false })
  @IsString()
  @IsOptional()
  passportNumber?: string;
  //============================================================================
  @ApiProperty({description:'Google reCAPTCHA token'})
  @IsNotEmpty({message : 'RECAPTCHA_REQUIRED'})
  @IsString()
  recaptchaToken:string;
  //============================================================================
  @ApiProperty({ description: 'Your Picture', required: false })
  @IsString()
  @IsOptional()
  picture?: string;
  //============================================================================
  @ApiProperty({ description: 'Birth Country', required: false })
  @IsString()
  @IsOptional()
  birthCountry ?: string;
  //============================================================================
  @ApiProperty({ description: 'Residence Country', required: false })
  @IsString()
  @IsOptional()
  residenceCountry ?: string;
  //============================================================================
  @ApiProperty({ description: 'Bio', required: false })
  @IsString()
  @IsOptional()
  bio ?: string;
  //============================================================================
  @ApiProperty({ description: 'Background Picture', required: false })
  @IsString()
  @IsOptional()
  coverPicture?: string;
}