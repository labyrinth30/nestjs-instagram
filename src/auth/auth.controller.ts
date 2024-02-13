import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 로그인
  @Post('login/email')
  loginEmail(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
     return this.authService.loginWithEmail({
       email,
       password,
     });
  }

  // 회원가입
  @Post('register/email')
  registerEmail(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('nickname') nickname: string,
  ) {
    return this.authService.registerWithEmail({
      email,
      password,
      nickname,
    });
  }
}
