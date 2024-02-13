import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from '../users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 토큰을 사용하게 되는 방식
   *
   * 1) 사용자가 로그인 또는 회원가입을 진행하면
   *  - accessToken과 refreshToken을 발급한다.
   *
   * 2) 로그인 할 때는 Basic 토큰과 함께 요청을 보낸다.
   *    Basic 토큰은 '이메일:비밀번호'를 base64로 인코딩한 값이다.
   *    예) {authorization: 'Basic {token}'}
   *
   * 3) 아무나 접근할 수 없는 정보를 접근 할 때는
   *    accessToken을 헤더에 담아서 요청을 보낸다.
   *    예) {authorization: 'Bearer {accessToken}'}
   *
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸
   *    사용자가 누구인지 알 수 있다.
   *    예를 들어 현재 로그인한 사용자가 작성한 포스트만 가져오려면
   *    토큰의 sub 값에 입력되어있는 사용자의 포스트만 가져오면 된다.
   *    특정 사용자의 토큰이 없다면 달느 사용자의 데이터를 접근 못한다.
   *
   * 5) 모든 토큰은 만료 기간이 있다. 만료 기간이 지나면 토큰을 다시 발급 받아야 한다.
   *    그렇지 않으면 jwtService.verify()에서 에러가 발생한다.
   *    그러니 access 토큰을 새로 발급 받을 수 있도록 /auth/token/access랑
   *    refresh 토큰을 새로 발급 받을 수 있도록 /auth/token/refresh를 만들어야 한다.
   *
   * 6) 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 엔드포인트에 요청을 해서
   *    새로운 토큰을 발급받고 새로운 토큰을 사용해서 private route에 접근한다
   */

  /**
   * Header로부터 토큰을 받을 때
   *
   * {authorization: 'Basic {token}'}
   * {authorization: 'Bearer {token}'}
   */

   extractTokenFromHeader(header: string, isBearer: boolean) {
    // 'Basic {token}' -> ['Basic', '{token}']
    // 'Bearer {token}' -> ['Bearer', '{token}']
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if(splitToken.length !== 2 || splitToken[0] !== prefix){
      throw new UnauthorizedException('토큰이 올바르지 않습니다.');
    }
    const token = splitToken[1];
    return token;
  }

  /**
   * Basic 토큰을 디코딩하는 방법
   * 1) djkalfjioeajo:djfaleioaff -> email:password
   * 2) email:password -> [email, password]
   * 3) {email: email, password: password}
   */
  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf-8');

    const split = decoded.split(':');
    if(split.length !== 2){
      throw new UnauthorizedException('토큰이 올바르지 않습니다.');
    }
    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    }
  }

  /**
   * 토큰을 검증하는 방법
   */
  verifyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: JWT_SECRET,
    })
  }

  /**
   * 토큰을 재발급하는 방법
   */
  rotateToken(token: string, isRefreshToken: boolean){
    const decoded = this.verifyToken(token);

    /**
     * sub: id
     * email: email
     * type: 'access' | 'refresh'
     */
    if(decoded.type !== 'refresh' ){
      throw new UnauthorizedException('토큰 재발급은 Refresh 토큰으로만 가능합니다.');
    }
    return this.signToken({
      ...decoded,
    }, isRefreshToken);
  }

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
      expiresIn: isRefreshToken ? 3600 : 300,
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

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>){
    const existingUser = await this.authenticateWithEmailAndPassword(user);
    return this.loginUser(existingUser);
  }

  async registerWithEmail(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>) {
    /**
     * 파라미터
     *
     * 1) 입력된 비밀번호
     * 2) 해쉬 라운드 -> 10 라운드
     * salt는 자동 생성
     */
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);
    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }


}
