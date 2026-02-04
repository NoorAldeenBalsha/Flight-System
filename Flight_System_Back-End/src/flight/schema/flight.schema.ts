import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FlightDocument = Flight & Document;
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
export class Flight {
  @Prop({ required: true, unique: true })
  flightNumber: string; 

  @Prop({ type: Object, required: true })
  origin: AirportName; 

  @Prop({ type: Object, required: true })
  destination: AirportName; 

  @Prop({ required: true })
  departureTime: Date;

  @Prop({ required: true })
  arrivalTime: Date;

  @Prop({
    enum: ['scheduled', 'boarding', 'delayed', 'completed', 'cancelled','took_off'],
    default: 'scheduled',
  })
  status: string;

  // ===== Time Analytics =====
  @Prop()
  actualDepartureTime?: Date;

  @Prop()
  actualArrivalTime?: Date;

  @Prop({ default: 0 })
  delayMinutes?: number;

  // ===== Financial Analytics =====

  @Prop({ default: 0 })
  revenue?: number;

  // ===== Operational Info =====
  @Prop()
  airlineCode?: string;

  @Prop({required:true})
  aircraftType?: string;

  @Prop()
  flightType?: 'domestic' | 'international';

  @Prop()
  gate?: string;

  // ===== Location Data =====
  @Prop({ type: Object })
  originLocation?: { lat: number; lng: number };

  @Prop({ type: Object })
  destinationLocation?: { lat: number; lng: number };
  @Prop({ default: Date.now })
archivedAt: Date;
}

export const FlightSchema = SchemaFactory.createForClass(Flight);