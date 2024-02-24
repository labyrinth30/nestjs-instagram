import { Controller, Get, Query } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { query } from 'express';
import { BasePaginationDto } from '../common/dto/base-pagination.dto';
import { PaginateChatDto } from './dto/paginate-chat.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  paginateChats(
    @Query() dto: PaginateChatDto,
  ){
    return this.chatsService.paginateChats(dto)
  }
}
