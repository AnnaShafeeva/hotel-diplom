import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ISupportRequestClientService,
  CreateSupportRequestDto,
  MarkMessagesAsReadDto,
} from './interfaces/support.interface';
import {
  SupportRequest,
  SupportRequestDocument,
} from './schemas/support-request.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { ID } from '../common/types/type';

@Injectable()
export class SupportRequestClientService
  implements ISupportRequestClientService
{
  constructor(
    @InjectModel(SupportRequest.name)
    private supportRequestModel: Model<SupportRequestDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async createSupportRequest(
    data: CreateSupportRequestDto,
  ): Promise<SupportRequest> {
    const supportRequest = new this.supportRequestModel({
      user: new Types.ObjectId(data.user),
      isActive: true,
    });
    await supportRequest.save();

    const message = new this.messageModel({
      supportRequest: supportRequest._id,
      author: new Types.ObjectId(data.user),
      text: data.text,
      sentAt: new Date(),
    });
    await message.save();

    return supportRequest;
  }

  async markMessagesAsRead(params: MarkMessagesAsReadDto): Promise<void> {
    await this.messageModel.updateMany(
      {
        supportRequest: new Types.ObjectId(params.supportRequest),
        author: { $ne: new Types.ObjectId(params.user) },
        readAt: null,
        sentAt: { $lte: params.createdBefore },
      },
      {
        readAt: new Date(),
      },
    );
  }

  async getUnreadCount(supportRequest: ID): Promise<number> {
    const request = await this.supportRequestModel.findById(supportRequest);
    if (!request) {
      throw new NotFoundException('Чат поддержки не найден');
    }
    return this.messageModel.countDocuments({
      supportRequest: new Types.ObjectId(supportRequest),
      author: { $ne: request.user },
      readAt: null,
    });
  }
}
