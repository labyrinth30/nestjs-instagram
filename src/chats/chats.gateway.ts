import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  // ws://localhost:3000/chats
  namespace: 'chats',

})
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

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
    this.server.in(message.chatId.toString()).emit('receive_message', message.message);
  }
}