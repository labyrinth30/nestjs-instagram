import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from '../../posts/entities/posts.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';

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
  @IsString()
  @Length(1, 20,{
    message: '닉네임은 1자 이상 20자 이하여야 합니다.'
  } )
  nickname: string;

  @Column({
    unique: true,
  })
  @IsString()
  @IsEmail(
    {},
    {
      message: '이메일 형식이 아닙니다.'
    }
  )
  // 1. 유일무이한 값이 될 것
  email: string;

  @Column()
  @IsString()
  @Length(3, 20, {
    message: '비밀번호는 3자 이상 20자 이하여야 합니다.'
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];


}
