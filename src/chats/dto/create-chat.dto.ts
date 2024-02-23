import { IsNumber } from 'class-validator';

export class CreateChatDto {

  // 방에 참여하는 사용자들의 아이디
  // 첫 번째 파라미터는 어떤 숫자들인지
  // 두 번째는 각각의 숫자가 유효한지
  @IsNumber({}, {each: true})
  userIds: number[];
}