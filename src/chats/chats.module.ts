import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatsGateway } from './chats.gateway';
import { ChatsModel } from './entity/chat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { ChatsMessagesService } from './messages/messages.service';
import { MessagesModel } from './messages/entity/messages.entity';
import { MessagesController } from './messages/messages.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatsModel, MessagesModel,]),
    CommonModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [ChatsController, MessagesController,],
  providers: [ChatsGateway,ChatsService, ChatsMessagesService,],
})
export class ChatsModule {}
