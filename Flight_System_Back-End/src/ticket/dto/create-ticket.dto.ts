import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {IsEnum,IsMongoId,IsNotEmpty,IsNumber,IsOptional,IsString, ValidateNested,} from 'class-validator';

export class TranslatedFieldDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  en: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ar?: string;
}
export class CreateTicketDto {
  @IsMongoId()
  @IsNotEmpty()
  flight: string;

  @IsString()
  @IsNotEmpty()
  seatNumber: string;

  @IsNumber()
  row: number;

  @IsString()
  seatLetter: string;

 @ApiProperty({ type: TranslatedFieldDto })
  @ValidateNested()
  @Type(() => TranslatedFieldDto)
  seatClass:TranslatedFieldDto;

 @ApiProperty({ type: TranslatedFieldDto })
  @ValidateNested()
  @Type(() => TranslatedFieldDto)
  seatSide: TranslatedFieldDto;

 @ApiProperty({ type: TranslatedFieldDto })
  @ValidateNested()
  @Type(() => TranslatedFieldDto)
  seatPosition: TranslatedFieldDto;

  @IsNumber()
  price: number;

  @IsEnum(['available', 'pending', 'sold'])
  @IsOptional()
  status?: 'available' | 'pending' | 'sold';

  
}