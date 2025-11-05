import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class TranslatedField {
  @Prop({ required: true })
  en: string;

  @Prop({ required: true })
  ar: string;
}

@Schema({ timestamps: true })
export class FlightArchive extends Document {
  @Prop({ required: true })
  flightNumber: string;

  @Prop({ required: true })
  origin: TranslatedField;

  @Prop({ required: true })
  destination: TranslatedField;

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