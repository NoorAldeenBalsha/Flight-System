import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class AirportName{
  en:string;
  es:string;
  ar:string;
  tr:string;
  jp:string;
  ru:string;
  zh:string;
  fr:string;
  de:string;
}

@Schema({ timestamps: true })
export class FlightArchive extends Document {
  @Prop({ required: true })
  flightNumber: string;

  @Prop({ required: true })
  origin: AirportName;

  @Prop({ required: true })
  destination: AirportName;

  @Prop({ required: true })
  departureTime: Date;

  @Prop({ required: true })
  arrivalTime: Date;

  @Prop({ required: true })
  status: string; 

  @Prop()
  aircraftType: string;

  @Prop()
  airline: string;

  @Prop()
  duration: string;

  @Prop()
  passengers: number;
  
  @Prop({ default: Date.now })
archivedAt: Date;
  
}

export const FlightArchiveSchema = SchemaFactory.createForClass(FlightArchive);
export type FlightArchiveDocument = FlightArchive & Document;