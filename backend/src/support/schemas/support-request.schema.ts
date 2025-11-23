import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupportRequestDocument = SupportRequest & Document;

@Schema({ timestamps: true })
export class SupportRequest {
  _id?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  messages: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;
}

export const SupportRequestSchema = SchemaFactory.createForClass(SupportRequest);