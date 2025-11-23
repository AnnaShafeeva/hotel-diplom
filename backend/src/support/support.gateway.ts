import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { SupportRequestService } from './support-request.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SupportGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Socket[]>();
  private socketUsers = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private supportRequestService: SupportRequestService,
  ) {
    // Подписываемся на события новых сообщений
    this.supportRequestService.subscribe((supportRequest, message) => {
      this.sendMessageToChat(supportRequest._id?.toString() || '', {
        id: message._id,
        createdAt: message.sentAt,
        text: message.text,
        readAt: message.readAt,
        author: {
          id: message.author._id,
          name: (message.author as any).name,
        },
      });
    });
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.id;

      this.socketUsers.set(client.id, userId);

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      const userSockets = this.userSockets.get(userId);
      if (userSockets) {
        userSockets.push(client);
      }

      console.log(`User ${userId} connected to support gateway`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      const userSockets = this.userSockets.get(userId);
      if (userSockets) {
        const index = userSockets.indexOf(client);
        if (index > -1) {
          userSockets.splice(index, 1);
        }
        if (userSockets.length === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.socketUsers.delete(client.id);
    }
  }

  @SubscribeMessage('subscribeToChat')
  handleSubscribeToChat(client: Socket, payload: { chatId: string }) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) return;

    client.join(`chat_${payload.chatId}`);
    console.log(`User ${userId} subscribed to chat ${payload.chatId}`);
  }

  sendMessageToChat(chatId: string, message: any) {
    this.server.to(`chat_${chatId}`).emit('newMessage', message);
  }
}
