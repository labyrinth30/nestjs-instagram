import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor{
  constructor(private readonly dataSource: DataSource,) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>):Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const path = req.originalUrl;
    // 트랜잭션과 관련된 모든 쿼리를 담당할
    // 쿼리 러너를 생성한다.
    const qr = this.dataSource.createQueryRunner();
    // 연결한다.
    await qr.connect();
    // 쿼리 러너에서 트랜잭션을 시작한다.
    // 이 시점부터 같은 쿼리 러너를 사용하면
    // 트랜잭션 안에서 데이터베이스 액션을 실행 할 수 있다.
    // 이 쿼리 러너 안에서 롤백을 하면 이전 상태로 돌아간다.
    // 커밋을 하면 지금까지의 액션을 데이터베이스에 반영된다.
    await qr.startTransaction();

    // 쿼리 러너를 req 객체에 담는 방법
    req.queryRunner = qr;
    // 로직 실행시 에러가 발생하면
    // 롤백을 실행한다.
    return next.handle().pipe(
      catchError( async (e) => {
        await qr.rollbackTransaction();
        await qr.release();

        throw new InternalServerErrorException(e.message);
      }),
      tap(
        async () => {
          await qr.commitTransaction();
          await qr.release();
        }
      ),
    );
  }
}