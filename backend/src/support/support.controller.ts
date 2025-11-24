import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SupportRequestService } from './support-request.service';
import { SupportRequestClientService } from './support-client.service';
import { SupportRequestEmployeeService } from './support-employee.service';
import { SupportGateway } from './support.gateway';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientGuard } from '../auth/guards/client.guard';
import { ManagerGuard } from '../auth/guards/manager.guard';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkMessagesReadDto } from './dto/mark-messages-read.dto';
import { GetSupportRequestsDto } from './dto/get-support-requests.dto';

@Controller('api')
export class SupportController {
  constructor(
    private supportRequestService: SupportRequestService,
    private supportClientService: SupportRequestClientService,
    private supportEmployeeService: SupportRequestEmployeeService,
    private supportGateway: SupportGateway,
  ) {}

  @UseGuards(JwtAuthGuard, ClientGuard)
  @Post('client/support-requests')
  async createRequest(
    @Body(ValidationPipe) body: CreateSupportRequestDto,
    @Request() req,
  ) {
    const request = await this.supportClientService.createSupportRequest({
      user: req.user.id,
      text: body.text,
    });

    const hasNewMessages =
      (await this.supportClientService.getUnreadCount(
        request._id?.toString() || '',
      )) > 0;

    return {
      id: request._id?.toString() || '',
      createdAt: request.createdAt,
      isActive: request.isActive,
      hasNewMessages,
    };
  }

  @UseGuards(JwtAuthGuard, ClientGuard)
  @Get('client/support-requests')
  async getClientRequests(
    @Query() query: GetSupportRequestsDto,
    @Request() req,
  ) {
    const requests = await this.supportRequestService.findSupportRequests({
      user: req.user.id,
      isActive: query.isActive,
      limit: query.limit,
      offset: query.offset,
    });

    return Promise.all(
      requests.map(async (request) => {
        const hasNewMessages =
          (await this.supportClientService.getUnreadCount(
            request._id?.toString() || '',
          )) > 0;

        return {
          id: request._id?.toString() || '',
          createdAt: request.createdAt,
          isActive: request.isActive,
          hasNewMessages,
        };
      }),
    );
  }

  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Get('manager/support-requests')
  async getManagerRequests(@Query() query: GetSupportRequestsDto) {
    const requests = await this.supportRequestService.findSupportRequests({
      user: null,
      isActive: query.isActive,
      limit: query.limit,
      offset: query.offset,
    });

    return Promise.all(
      requests.map(async (request) => {
        const hasNewMessages =
          (await this.supportEmployeeService.getUnreadCount(
            request._id?.toString() || '',
          )) > 0;

        return {
          id: request._id?.toString() || '',
          createdAt: request.createdAt,
          isActive: request.isActive,
          hasNewMessages,
          client: request.user,
        };
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('common/support-requests/:id/messages')
  async getMessages(@Param('id') id: string, @Request() req) {
    await this.checkChatAccess(id, req.user);

    const messages = await this.supportRequestService.getMessages(id);

    return messages.map((message) => {
      const author = message.author as any;

      return {
        id: message._id?.toString() || '',
        createdAt: message.sentAt,
        text: message.text,
        readAt: message.readAt || null,
        author: {
          id: author._id?.toString() || '',
          name: author.name || 'Пользователь',
        },
      };
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('common/support-requests/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body(ValidationPipe) body: SendMessageDto,
    @Request() req,
  ) {
    await this.checkChatAccess(id, req.user);

    const message = await this.supportRequestService.sendMessage({
      supportRequest: id,
      author: req.user.id,
      text: body.text,
    });

    const messageWithAuthor = {
      id: message._id?.toString() || '',
      createdAt: message.sentAt,
      text: message.text,
      readAt: message.readAt || null,
      author: {
        id: req.user.id,
        name: req.user.name,
      },
    };

    this.supportGateway.sendMessageToChat(id, messageWithAuthor);

    return messageWithAuthor;
  }

  @UseGuards(JwtAuthGuard)
  @Post('common/support-requests/:id/messages/read')
  async markAsRead(
    @Param('id') id: string,
    @Body(ValidationPipe) body: MarkMessagesReadDto,
    @Request() req,
  ) {
    await this.checkChatAccess(id, req.user);
    const createdBefore = new Date(body.createdBefore);

    if (req.user.role === 'client') {
      await this.supportClientService.markMessagesAsRead({
        user: req.user.id,
        supportRequest: id,
        createdBefore,
      });
    } else if (req.user.role === 'manager') {
      await this.supportEmployeeService.markMessagesAsRead({
        user: req.user.id,
        supportRequest: id,
        createdBefore,
      });
    }

    return { success: true };
  }

  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Delete('manager/support-requests/:id')
  async closeRequest(@Param('id') id: string) {
    await this.supportEmployeeService.closeRequest(id);
    return { success: true };
  }

  private async checkChatAccess(chatId: string, user: any): Promise<void> {
    const chat = await this.supportRequestService.findById(chatId);

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    if (user.role === 'client') {
      if (!chat.user) {
        throw new ForbiddenException('Некорректные данные чата');
      }
      if (chat.user._id.toString() !== user.id) {
        throw new ForbiddenException('Доступ запрещён');
      }
    }
  }
}
