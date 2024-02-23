import { Entity, ManyToMany } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { UsersModel } from '../../users/entity/users.entity';

@Entity()
export class ChatsModel extends BaseModel{

  @ManyToMany(() => UsersModel, (user) => user.chats)
  users: UsersModel[];

}