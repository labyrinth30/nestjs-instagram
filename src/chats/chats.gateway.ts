import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatsModel } from './entity/chat.entity';
import { Repository } from 'typeorm';
import { ChatsService } from './chats.service';

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',

})
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly chatsService: ChatsService,
  ) {}

  handleConnection(socket: Socket) {
    console.log(`on connect called: ${socket.id}`);
  }
  // socket.on('send_message', (message) => { console.log(message); });

  @SubscribeMessage('enter_chat')
  enterChat(
    // 방의 chat Id들을 리스트로 받는다.
    @MessageBody() data: number[],
    @ConnectedSocket() socket: Socket,
  ){
    for(const chatId of data){
      // socket.join() 실행해야 한다.
      socket.join(chatId.toString());
    }
  }

  @SubscribeMessage('send_message')
  sendMessage(
    @MessageBody() message: { message: string, chatId: number },
    @ConnectedSocket() socket: Socket,
  ){
    // 선택한 chatID의 방에 있는 사용자만 메시지를 받는다.
    // this.server.in(message.chatId.toString()).emit('receive_message', message.message);

    // broadcating 방법
    // 보낸 사람 빼고 모두에게 보낸다.
    socket.to(message.chatId.toString()).emit('receive_message', message.message);
  }

  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ){
    const chat = await this.chatsService.createChat(
      data,
    );
  }
}