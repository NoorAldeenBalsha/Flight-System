import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, IsDate, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class TranslatedFieldDto {
  @ApiProperty({ example: 'Dubai', description: 'English name' })
  @IsString()
  @IsOptional()
  en?: string;

  @ApiProperty({ example: 'دبي', description: 'Arabic name', required: false })
  @IsString()
  @IsOptional()
  ar?: string;
}

export class LocationDto {
  @ApiProperty({ example: 25.2532, description: 'Latitude' })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 55.3657, description: 'Longitude' })
  @IsNumber()
  lng: number;
}

export class CreateFlightDto {
  @ApiProperty({ example: 'EK300', description: 'Unique flight number' })
  @IsString()
  @IsNotEmpty()
  flightNumber: string;

  @ApiProperty({ type: TranslatedFieldDto })
  @ValidateNested()
  @Type(() => TranslatedFieldDto)
  origin: TranslatedFieldDto;

  @ApiProperty({ type: TranslatedFieldDto })
  @ValidateNested()
  @Type(() => TranslatedFieldDto)
  destination: TranslatedFieldDto;

  @ApiProperty({ example: '2025-10-25T08:00:00.000Z', description: 'Planned departure time' })
  @IsDate()
  @Type(() => Date)
  departureTime: Date;

  @ApiProperty({ example: '2025-10-25T12:00:00.000Z', description: 'Planned arrival time' })
  @IsDate()
  @Type(() => Date)
  arrivalTime: Date;

  @ApiProperty({ enum: ['scheduled', 'boarding','delayed', 'completed', 'cancelled','took_off'], default: 'scheduled' })
  @IsEnum(['scheduled', 'boarding','delayed', 'completed', 'cancelled','took_off'])
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 0, description: 'Total revenue from tickets', required: false })
  @IsOptional()
  @IsNumber()
  revenue?: number;

  @Transform(({ value }) => {
    const val = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(val) ? value : val;
  })
  
  @ApiProperty({ example: 'EK', description: 'Airline code', required: false })
  @IsOptional()
  @IsString()
  airlineCode?: string;

  @ApiProperty({ example: 'Boeing 777', description: 'Aircraft type', required: false })
  @IsOptional()
  @IsString()
  aircraftType?: string;

  @ApiProperty({ enum: ['domestic', 'international'], required: false })
  @IsOptional()
  @IsEnum(['domestic', 'international'])
  flightType?: 'domestic' | 'international';

  @ApiProperty({ example: 'A12', description: 'Gate assigned for boarding', required: false })
  @IsOptional()
  @IsString()
  gate?: string;

  @ApiProperty({ type: LocationDto, required: false })
  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  originLocation?: LocationDto;

  @ApiProperty({ type: LocationDto, required: false })
  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  destinationLocation?: LocationDto;
}