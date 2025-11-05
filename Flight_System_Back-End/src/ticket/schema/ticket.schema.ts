import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class TranslatedField {
  @Prop({ required: true })
  en: string;

  @Prop({ required: true })
  ar: string;
}

@Schema({ timestamps: true })
export class Ticket extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Flight', required: true })
  flight: Types.ObjectId | string;

  @Prop({ required: true })
  seatNumber: string;

  @Prop({ required: true })
  row: number;

  @Prop({ required: true })
  seatLetter: string;

  @Prop({ type: Object, required: true })
  seatClass: TranslatedField;

  @Prop({ type: Object, required: true })
  seatSide: TranslatedField;

  @Prop({ type: Object, required: true })
  seatPosition: TranslatedField;

  @Prop({ required: true })
  price: number;

  @Prop({
    required: true,
    enum: ['available', 'pending', 'sold'],
    default: 'available',
  })
  status: 'available' | 'pending' | 'sold';

  @Prop({
    required: true,
    unique: true,
    default: async function (this: Ticket) {
      const { v4: uuidv4 } = await import('uuid');
      return `${this._id}-${uuidv4().slice(0, 6)}`;
    },
  })
  bookingReference: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  bookedBy?: Types.ObjectId | string|null;

  @Prop({ type: Date, default: null })
  pendingAt?: Date | null;

  @Prop({ default: Date.now })
archivedAt: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);