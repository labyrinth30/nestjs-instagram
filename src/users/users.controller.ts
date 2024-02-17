import { Body, ClassSerializerInterceptor, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('유저 API')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '유저 생성하기', description: '유저를 생성합니다.'})
  postUser(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ){
    return this.usersService.createUser({email, nickname, password});
  }

  @Get()
  @ApiOperation({ summary: '유저 전체 조회', description: '모든 유저를 조회합니다.'})
  /**
   * serialization -> 직렬화 -> 현재 시스템에서 사용되는 (NestJS) 데이터의 구조를 다른 시스템에서도 사용할 수 있는 포맷으로 변환
   * 여기서는 class의 object -> JSON으로 변환
   *
   * deserialization -> 역직렬화 -> 다른 시스템에서 사용되는 데이터의 구조를 현재 시스템에서 사용하는 포맷으로 변환
   */
  getUsers() {
    return this.usersService.getAllUsers();
  }
}
