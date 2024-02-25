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
import { CreateMessagesDto } from './messages/dto/create-messages.dto';
import { ChatsMessagesService } from './messages/messages.service';
import { UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from '../common/exception-filter/socket-catch-http.exception-filter';
import { SocketBearerTokenGuard } from '../auth/guard/socket/socket-bearer-token.guard';
import { UsersModel } from '../users/entity/users.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',

})
export class ChatsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly userService: UsersService,
    private readonly messageService: ChatsMessagesService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer()
  server: Server;


  async handleConnection(socket: Socket & {user: UsersModel}) {
    // 소켓에 사용자 정보 저장하기
    // 소켓은 한 번 연결되면 지속됨
    console.log(`on connect called: ${socket.id}`);
    // 지금 연결하여 통신중인 소켓 가져오기
    const headers = socket.handshake.headers;

    // Bearer xxxxxx
    const rawToken = headers['authorization'];
    if(!rawToken){
      // 액세스 토큰 없이 연결하면 연결 해제
      socket.disconnect();
    }

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const payload = this.authService.verifyToken(token);
      const user = await this.userService.getUserByEmail(payload.email);
      socket.user = user;
      return true;
    } catch(e){
      // 연결 강제종료
      // 액세스 토큰의 유효기간이 끝나면 연결 해제
      socket.disconnect();
    }
  }
  // socket.on('send_message', (message) => { console.log(message); });

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }))
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('enter_chat')
  async enterChat(
    // 방의 chat Id들을 리스트로 받는다.
    @MessageBody() data: EnterChatDto & {user: UsersModel},
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

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }))
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket & {user: UsersModel},
  ){
    // 선택한 chatID의 방에 있는 사용자만 메시지를 받는다.
    // this.server.in(message.chatId.toString()).emit('receive_message', message.message);

    // broadcating 방법
    // 보낸 사람 빼고 모두에게 보낸다.
    // 우선 chat이 존재하는 지 확인한다.
    const chat = await this.chatsService.checkIfChatExists(dto.chatId);
    if(!chat){
      throw new WsException({
        message: `존재하지 않는 chat입니다. chatId: ${dto.chatId}`,
        code: 404,
      });
    }
    const message = await this.messageService.createMessage(
      dto,
      socket.user.id,
    );
    socket.to(message.chat.id.toString()).emit('receive_message', message.message);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }))
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket & {user: UsersModel},
  ){

    const chat = await this.chatsService.createChat(
      data,
    );
  }
}