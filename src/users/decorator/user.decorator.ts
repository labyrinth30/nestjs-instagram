import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { UsersModel } from '../entities/users.entity';

// data는 데코레이터를 사용할 때 넣어주는 값이다.
// context는 guard나 interceptor에서 사용하는 것과 동일하다.
export const User = createParamDecorator((data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user = req.user as UsersModel;
    if(!user){
      throw new InternalServerErrorException('User 데코레이터는 AccessTokenGuard와 함께 사용해야합니다. Request에 user 프로퍼티가 존재하지 않습니다');
    }

    if(data){
       return user[data];
    }

    return user;
});