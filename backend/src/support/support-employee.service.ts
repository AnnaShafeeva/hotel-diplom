import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ISupportRequestEmployeeService,
  MarkMessagesAsReadDto,
} from './interfaces/support.interface';
import {
  SupportRequest,
  SupportRequestDocument,
} from './schemas/support-request.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { ID } from '../common/types/type';

@Injectable()
export class SupportRequestEmployeeService
  implements ISupportRequestEmployeeService
{
  constructor(
    @InjectModel(SupportRequest.name)
    private supportRequestModel: Model<SupportRequestDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async markMessagesAsRead(params: MarkMessagesAsReadDto): Promise<void> {
    const request = await this.supportRequestModel.findById(
      params.supportRequest,
    );
    if (!request) return;

    // Помечаем сообщения от пользователя как прочитанные
    await this.messageModel.updateMany(
      {
        supportRequest: new Types.ObjectId(params.supportRequest),
        author: request.user, // именно пользователь, создавший запрос
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
      author: request.user, // пользователь, создавший запрос
      readAt: null,
    });
  }

  async closeRequest(supportRequest: ID): Promise<void> {
    await this.supportRequestModel.findByIdAndUpdate(supportRequest, {
      isActive: false,
    });
  }
}
