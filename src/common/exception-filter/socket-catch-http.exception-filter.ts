import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';

// BaseWsExceptionFilter를 상속받아서 사용하면
// 웹 소켓 관련 예외 필터를 만들 수 있다.
@Catch(HttpException)
export class SocketCatchHttpExceptionFilter extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const socket = host.switchToWs().getClient();

    socket.emit(
      'exception',
      {
        // exception.getResponse()는 HttpException의 응답 객체를 반환한다.
        /**
         * "data": {
         *         "message": [
         *             "each value in userIds must be a number conforming to the specified constraints"
         *         ],
         *         "error": "Bad Request",
         *         "statusCode": 400
         *     }
         */
        data: exception.getResponse(),
      }
    );
  }
}