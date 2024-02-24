import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { CommonService } from '../common/common.service';
import { EnterChatDto } from './dto/enter-chat.dto';

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',

})
export class ChatsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly commonService: CommonService,
  ) {}

  @WebSocketServer()
  server: Server;


  handleConnection(socket: Socket) {
    console.log(`on connect called: ${socket.id}`);
  }
  // socket.on('send_message', (message) => { console.log(message); });

  @SubscribeMessage('enter_chat')
  async enterChat(
    // 방의 chat Id들을 리스트로 받는다.
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket,
  ){
    for(const chatId of data.chatIds){
      const exists = await this.chatsService.checkIfChatExists(chatId);
      if(!exists){
        throw new WsException({
          message: `존재하지 않는 chat입니다. chatId: ${chatId}`,
          code: 404,
        });
      }
    }
    socket.join(data.chatIds.map((x) => x.toString()));
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