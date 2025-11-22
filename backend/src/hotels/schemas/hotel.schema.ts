import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HotelDocument = Hotel & Document;

@Schema({ timestamps: true })
export class Hotel {
  _id?: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);
