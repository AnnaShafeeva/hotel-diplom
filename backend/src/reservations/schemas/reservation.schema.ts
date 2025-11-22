import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  _id?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hotel', required: true })
  hotelId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'HotelRoom', required: true })
  roomId: Types.ObjectId;

  @Prop({ required: true })
  dateStart: Date;

  @Prop({ required: true })
  dateEnd: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
