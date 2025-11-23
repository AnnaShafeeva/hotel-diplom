import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ISupportRequestService,
  SendMessageDto,
  GetChatListParams,
} from './interfaces/support.interface';
import {
  SupportRequest,
  SupportRequestDocument,
} from './schemas/support-request.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { ID } from '../common/types/type';
import { EventEmitter } from 'events';

@Injectable()
export class SupportRequestService implements ISupportRequestService {
  private readonly eventEmitter = new EventEmitter();

  constructor(
    @InjectModel(SupportRequest.name)
    private supportRequestModel: Model<SupportRequestDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async findSupportRequests(
    params: GetChatListParams,
  ): Promise<SupportRequest[]> {
    const filter: any = {};

    if (params.user) {
      filter.user = new Types.ObjectId(params.user);
    }

    if (params.isActive !== undefined) {
      filter.isActive = params.isActive;
    }

    let query = this.supportRequestModel
      .find(filter)
      .populate('user', 'name email contactPhone')
      .sort({ createdAt: -1 });

    if (params.limit) {
      query = query.limit(params.limit).skip(params.offset || 0);
    }

    return query.exec();
  }

  async findById(id: string): Promise<SupportRequest | null> {
    return this.supportRequestModel.findById(id).populate('user').exec();
  }

  async sendMessage(data: SendMessageDto): Promise<Message> {
    const message = new this.messageModel({
      supportRequest: new Types.ObjectId(data.supportRequest),
      author: new Types.ObjectId(data.author),
      text: data.text,
      sentAt: new Date(),
    });

    const savedMessage = await message.save();

    // Получаем полный объект SupportRequest для события
    const supportRequest = await this.supportRequestModel
      .findById(data.supportRequest)
      .populate('user')
      .exec();

    // Отправляем событие о новом сообщении
    this.eventEmitter.emit('newMessage', supportRequest, savedMessage);

    return savedMessage;
  }

  async getMessages(supportRequest: ID): Promise<Message[]> {
    const request = await this.supportRequestModel.findById(supportRequest);
    if (!request) {
      throw new NotFoundException('Чат поддержки не найден');
    }
    return this.messageModel
      .find({ supportRequest: new Types.ObjectId(supportRequest) })
      .populate('author', 'name')
      .sort({ sentAt: 1 })
      .exec();
  }

  subscribe(
    handler: (supportRequest: SupportRequest, message: Message) => void,
  ): () => void {
    this.eventEmitter.on('newMessage', handler);

    return () => {
      this.eventEmitter.off('newMessage', handler);
    };
  }
}
