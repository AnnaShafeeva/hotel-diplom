import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { SupportRequestService } from './support-request.service';
import { SupportRequestClientService } from './support-client.service';
import { SupportRequestEmployeeService } from './support-employee.service';
import { SupportController } from './support.controller';
import { SupportGateway } from './support.gateway';
import {
  SupportRequest,
  SupportRequestSchema,
} from './schemas/support-request.schema';
import { Message, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportRequest.name, schema: SupportRequestSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    JwtModule,
  ],
  providers: [
    SupportRequestService,
    SupportRequestClientService,
    SupportRequestEmployeeService,
    SupportGateway,
  ],
  controllers: [SupportController],
  exports: [
    SupportRequestService,
    SupportRequestClientService,
    SupportRequestEmployeeService,
  ],
})
export class SupportModule {}
