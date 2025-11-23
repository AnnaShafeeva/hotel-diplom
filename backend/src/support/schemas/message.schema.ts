import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PopulatedAuthor } from '../interfaces/author.interface';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  _id?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId | PopulatedAuthor;

  @Prop({ default: Date.now })
  sentAt: Date;

  @Prop({ required: true })
  text: string;

  @Prop()
  readAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
