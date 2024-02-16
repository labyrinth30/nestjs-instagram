import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsString } from 'class-validator';

@Entity()
export class PostsModel extends BaseModel{

  // 1) UsersModel과 외래키를 이용하여 연결한다.
  // 2) Nullable: false
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false
  })
  author: UsersModel;
  @Column()
  @IsString({
    message: 'title은 string type로 입력해주세요.'
  })
  title: string;
  @Column()
  @IsString({
    message: 'content는 string type로 입력해주세요.'
  })
  content: string;
  @Column()
  likeCount: number;
  @Column()
  commentCount: number;
}
