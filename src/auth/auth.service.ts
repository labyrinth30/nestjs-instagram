import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  /**
   * 우리가 만드려는 기능
   *
   * 1) registerWithEmail
   *    - email, nickname. password를 받아서 새로운 유저를 생성하는 기능
   *    - 생성이 완료되면, accessToken과 refreshToken을 발급한다.
   *    회원가입 후 다시 로그인해주세요 <- 이런 쓸데없는 과정을 방지하기 위해서
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
}
