import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsEmail, MinLength, IsOptional, IsEnum, IsNotEmpty, MaxLength, Matches, Length, isNotEmpty } from 'class-validator';
import { UserGender, UserRole } from 'utilitis/enums';

export class UpdateUserDto{
  @ApiProperty({ description: 'Name of the user', example: 'Noor Aldeen Balsha' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  fullName: string;
  //============================================================================
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email: string;
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
  //============================================================================
}