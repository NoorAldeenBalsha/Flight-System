import { IsMongoId, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  seatId: string;

  @IsMongoId()
  userId: string;

  @IsNumber()
  price: number;

  @IsObject()
  seatClass: { en: string; ar: string };

  @IsObject()
  seatSide: { en: string; ar: string };

  @IsObject()
  seatPosition: { en: string; ar: string };

  @IsString()
  seatLetter: string;

  @IsString()
  seatNumber: string;
}