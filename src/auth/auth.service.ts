import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from '../users/entities/users.entity';
import { JWT_SECRET } from './const/auth.const';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  /**
   * 우리가 만드려는 기능
   *
   * 1) registerWithEmail
   *    - email, nickname. password를 받아서 새로운 유저를 생성하는 기능
   *    - 생성이 완료되면, accessToken과 refreshToken을 발급한다.
   *    회원가입 후 다시 로그인해주세요 <- 이런 쓸데없는 과정을 방지하기 위해서
   *
   *
   * 2) loginWithEmail
   *    - email, password를 받아서 로그인하는 기능
   *    - 로그인이 완료되면, accessToken과 refreshToken을 발급한다.
   *
   * 3) loginUser
   *    - (1)과 (2)에서 필요한 accessToken과 refreshToken을 반환하는 기능
   *
   * 4) signToken
   *    - (3)에서 필요한 accessToken과 refreshToken을 발급하는 기능
   *
   * 5) authenticateWithEmailAndPassword
   *    - (2)에서 로그인을 진행할 때 필요한 기본적인 검증 진행
   *    1. email이 존재하는지
   *    2. password가 일치하는지
   *    3. 모두 통과되면 유저 정보를 반환한다.
   *    4. loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
   *
   */

  /**
   * Payload에 들어갈 정보
   *
   * 1) email
   * 2) sub -> id
   * 3) type: 'access' | 'refresh'
   *
   * 사용자 정보 중에 email, id를 가지고 토큰을 발급한다.
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean){
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      // seconds
      expiresIn: isRefreshToken ? '3600' : '300',
    })
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    const accessToken = this.signToken(user, false);
    const refreshToken = this.signToken(user, true);
    return {
      accessToken,
      refreshToken,
    };
  }

  async authenticateWithEmailAndPassword(user: Pick<UsersModel, 'email' | 'password'>) {
    // 1) email이 존재하는지
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }
    // 2) password가 일치하는지
    /**
     * 파라미터
     *
     * 1. 입력된 비밀번호
     * 2. 기존 해시(hash) -> 사용자 정보에 저장되어있는 hash
     */
    const passOk: boolean = await bcrypt.compare(user.password, existingUser.password);

    if(!passOk) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
    // 3) 모두 통과되면 유저 정보를 반환한다.
    return existingUser;
  }
}
