import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from '../../posts/entities/posts.entity';
import { BaseModel } from '../../common/entity/base.entity';

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
  nickname: string;

  @Column({
    unique: true,
  })
  // 1. 유일무이한 값이 될 것
  email: string;

  @Column()
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];


}
