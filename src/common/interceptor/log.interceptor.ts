import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor{
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    /**
     * 요청이 들어올 때 REQ 요청이 들어온 타임스탬프를 찍어준다.
     * [REQ] {요청 path} {요청 시간}
     *
     * 요청이 끝날 때 (응답이 나갈 때) 다시 타임스탬프를 찍는다.
     * [RES] {요청 path} {응답 시간} {얼마나 걸렸는지 ms}
     */
     const req = context.switchToHttp().getRequest();

     // /posts
     // /common/image
     const path = req.originalUrl;

     const now = new Date();

     // [REQ] {요청 path} {요청 시간}
     console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

     // 이 위까지는 엔드포인트의 로직이 실행되기전에 실행됨
     // return next.handle()을 실행하는 순간
     // 라우트의 로직이 전부 실행되고 응답이 반환된다.
     // observable로 반환한다.
     // rxjs를 사용하여 비동기로 처리한다.
     // pipe 안에서 rxjs의 연산자를 사용하여 로직을 처리한다.
     // tap을 하면 observable를 모니터링 할 수 있다.
     return next
       .handle()
       .pipe(
         tap((observable) =>{
           // [RES] {요청 path} {응답 시간} {얼마나 걸렸는지 ms}
            const res = new Date();
            const elapsed = res.getMilliseconds() - now.getMilliseconds();
            console.log(`[RES] ${path} ${res.toLocaleString('kr')} ${elapsed}ms`);
         } ),
       //   map(
       //     (observable) => {
       //       return {
       //         message: '응답이 변경되었습니다.',
       //         response: observable
       //       }
       //     }
       //   ),
       //   tap((observable) =>{
       //     console.log(observable);
       //   } ),
       );
  }
}