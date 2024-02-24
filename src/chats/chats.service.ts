import { Injectable } from '@nestjs/common';
import { ChatsModel } from './entity/chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { CommonService } from '../common/common.service';
import { BasePaginationDto } from '../common/dto/base-pagination.dto';
import { PaginateChatDto } from './dto/paginate-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService,
  ) {}

  paginateChats(dto: PaginateChatDto,){
    return this.commonService.paginate(
      dto,
      this.chatsRepository,
      {
        relations: ['users']
      },
      'chats',
      );
    }


  async createChat(dto: CreateChatDto){
    const chat = await this.chatsRepository.save({
      // 1,2,3
      // [{id:1}, {id:2}, {id:3}]
      users: dto.userIds.map( (id) => ({id})),
    });

    return this.chatsRepository.find({
      where: {
        id: chat.id,
      }
    })
  }
}
