import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatsGateway } from './chats.gateway';
import { ChatsModel } from './entity/chat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatsModel]),
  ],
  controllers: [ChatsController],
  providers: [ChatsGateway,ChatsService],
})
export class ChatsModule {}
