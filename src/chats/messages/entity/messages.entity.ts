import { BaseModel } from '../../../common/entity/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ChatsModel } from '../../entity/chat.entity';
import { UsersModel } from '../../../users/entity/users.entity';
import { IsString } from 'class-validator';

@Entity()
export class MessagesModel extends BaseModel {
  // 어떤 채팅방인지
  @ManyToOne(() => ChatsModel, (chat) => chat.messages)
  chat: ChatsModel;

  // 어떤 사용자가 작성한 메시지인지
  @ManyToOne(() => UsersModel, (user) => user.messages )
  author: UsersModel;

  @Column()
  @IsString()
  message: string;
}