import {PipeTransform, Injectable, ArgumentMetadata, BadRequestException} from '@nestjs/common';

@Injectable()
export class PasswordPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // value는 실제로 입력받은 값
    // metadata는 해당 파이프가 적용된 파라미터에 대한 정보
    if (value.toString().length > 8) {
      throw new BadRequestException('비밀번호는 8자 이하로 입력해주세요!');
    }
    return value.toString();
  }
}


@Injectable()
export class MaxLengthPipe implements PipeTransform {
    constructor(private readonly maxLength: number,
                private readonly subject: string) {}

    transform(value: any, metadata: ArgumentMetadata) {
      if(value.toString().length > this.maxLength){
        throw new BadRequestException(`${this.subject}의 최대 길이는 ${this.maxLength}자 입니다.`);
      }

      return value.toString();
    }
}

@Injectable()
export class MinLengthPipe implements PipeTransform{
    constructor(private readonly minLength: number,
                private readonly subject: string) {}

    transform(value: any, metadata: ArgumentMetadata) {
      if(value.toString().length < this.minLength){
        throw new BadRequestException(`${this.subject}의 최소 길이는 ${this.minLength}자 입니다.`);
      }

      return value.toString();
    }
}