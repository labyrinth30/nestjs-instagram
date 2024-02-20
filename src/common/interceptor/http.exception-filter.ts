import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();
    const status = exception.getStatus();

    // 에러가 생겼다는 걸 어디에 알려줘야함
    // 로그 파일을 생성하거나, 에러 모니터링 시스템에 API 콜 하기

    response
      .status(status)
      .json({
        statusCode: status,
        message: exception.message,
        timestamp: new Date().toLocaleString('kr'),
        path: request.url,
      })
  }
}