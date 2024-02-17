import { Column, Entity, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from '../../posts/entities/posts.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { emailValidationMessgae } from '../../common/validation-message/email-validation-messgae';
import { Exclude, Expose } from 'class-transformer';

/**
 * id: number
 *
 * nickname: string
 *
 * email: string
 *
 * password: string
 *
 * role: [RolesEnum.USER, RolesEnum.ADMIN]
 *
 * createdAt: Date
 *
 * updatedAt: Date
 */

@Entity()
export class UsersModel extends BaseModel{

  @Column({
    length: 20,
    unique: true,
  })
  // 1. 최대 길이 20자
  // 2. 유일무이한 값이 될 것
  @IsString({
      message: stringValidationMessage,
    }
  )
  @Length(1, 20,{
  message: lengthValidationMessage
  } )
  nickname: string;

  @Column({
    unique: true,
  })
  @IsString({
      message: stringValidationMessage,
    }
  )
  @IsEmail(
    {},
    {
      message: emailValidationMessgae,
    }
  )
  // 1. 유일무이한 값이 될 것
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
    }
  )
  @Length(3, 20, {
    message: lengthValidationMessage,
  })
  /**
   * Request
   * Frontend -> Backend
   * plain object (JSON) -> class instance(dto)
   *
   * Response
   * Backend -> Frontend
   * class instance(dto) -> plain object (JSON)
   *
   * toClassOnly: class instance -> plain object -> 요청을 보낼 때만 적용
   * toPlainOnly: plain object -> class instance -> 응답으로 보낼 때만 적용
   */
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];


  // @Expose()
  // get nicknameAndEmail(): string {
  //   return `${this.nickname} + ${this.email}`;
  // }
}
