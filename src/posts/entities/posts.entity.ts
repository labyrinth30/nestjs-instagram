import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';

@Entity()
export class PostsModel {
  @PrimaryGeneratedColumn()
  id: number;

  // 1) UsersModel과 외래키를 이용하여 연결한다.
  // 2) Nullable: false
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false
  })
  author: UsersModel;
  @Column()
  title: string;
  @Column()
  content: string;
  @Column()
  likeCount: number;
  @Column()
  commentCount: number;
}
