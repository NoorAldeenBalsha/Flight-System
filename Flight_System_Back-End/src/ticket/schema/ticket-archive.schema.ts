import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ArchivedTicket extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Flight' })
  flight: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  seatNumber: string;

  @Prop()
  price: number;

  @Prop()
  status: string;

  @Prop({ default: Date.now })
archivedAt: Date;
}

export const ArchivedTicketSchema = SchemaFactory.createForClass(ArchivedTicket);