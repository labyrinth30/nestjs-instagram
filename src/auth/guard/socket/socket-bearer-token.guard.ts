import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { WsException } from '@nestjs/websockets';
import { UsersService } from '../../../users/users.service';

@Injectable()
export class SocketBearerTokenGuard implements CanActivate{
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ){}
  async canActivate(context: ExecutionContext): Promise<boolean>{

      // 지금 연결하여 통신중인 소켓 가져오기
      const socket = context.switchToWs().getClient();
      const headers = socket.handshake.headers;

      // Bearer xxxxxx
      const rawToken = headers['authorization'];
      if(!rawToken){
        throw new WsException('인증 토큰이 필요합니다.');
      }
    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const payload = this.authService.verifyToken(token);
      const user = await this.userService.getUserByEmail(payload.email);
      socket.user = user;
      socket.token = token;
      socket.tokenType = payload.tokenType;

      return true;
    } catch(e){
      throw new WsException('토큰이 유효하지 않습니다');
    }
  }
}