import { Get, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessagesModel } from './entity/messages.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { CommonService } from '../../common/common.service';
import { BasePaginationDto } from '../../common/dto/base-pagination.dto';
import { CreateMessagesDto } from './dto/create-messages.dto';

@Injectable()
export class ChatsMessagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly messageRepository: Repository<MessagesModel>,
    private readonly commonService: CommonService,
  ){}

  // Paginate
  @Get()
  async paginateMessages(
    dto: BasePaginationDto,
    overrideFindOptions: FindManyOptions<MessagesModel>
  ){
    return this.commonService.paginate(
      dto,
      this.messageRepository,
      overrideFindOptions,
      'messages',
    )
  }

  // Create
  async createMessage(dto: CreateMessagesDto){
    const message = await this.messageRepository.save({
      chat: {
        id: dto.chatId,
      },
      author: {
        id: dto.authorId,
      },
      message: dto.message,
    });

    return this.messageRepository.findOne({
      relations: ['chat'],
      where: {
        id: message.id,
      }
    });
  }

}