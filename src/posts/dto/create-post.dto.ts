import { IsString } from 'class-validator';

export class CreatePostDto{
  @IsString({
    message: 'title은 string type로 입력해주세요.'
  })

  title: string;

  @IsString({
    message: 'content는 string type로 입력해주세요.'
  })
  content: string;
}