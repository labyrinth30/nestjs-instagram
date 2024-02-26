import { BadRequestException, Injectable } from '@nestjs/common';
import { CommonService } from '../../common/common.service';
import { CommentsModel } from './entity/comments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { UsersModel } from '../../users/entity/users.entity';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comment-find-options.const';
import { UpdateCommentsDto } from './dto/update-comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commonService: CommonService,
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
  ) {}

  paginateComments(
    dto: PaginateCommentsDto,
    postId: number,
  ){
    return this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        ...DEFAULT_COMMENT_FIND_OPTIONS,
        where: {
          post: {
            id: postId,
          },
        }
      },
      `posts/${postId}/comments`,
      );
  }

  async getCommentById(
    id: number,
  ){
    const comment = await this.commentsRepository.findOne({
      ...DEFAULT_COMMENT_FIND_OPTIONS,
      where: {
        id,
      }
    });
    if(!comment){
      throw new BadRequestException(`id: ${id}에 해당하는 Comment는 없습니다.`);
    }
    return comment;
  }

  async createComment(
    dto: CreateCommentsDto,
    postId: number,
    author: UsersModel,
  ){
    return this.commentsRepository.save({
      ...dto,
      post: {
        id: postId,
      },
      author,
    });
  }

  async updateComment(
    commentId: number,
    dto: UpdateCommentsDto,
  ){
    const comment = await this.commentsRepository.findOne({
      where:{
        id: commentId
      }
    });
    if(!comment){
      throw new BadRequestException(`id: ${commentId}에 해당하는 Comment는 없습니다.`);
    }

    const prevComment = await this.commentsRepository.preload({
      id: commentId,
      ...dto,
    });
    const newComment = await this.commentsRepository.save(prevComment);
    return newComment;
  }

  async deleteComment(
    id: number,
  ){
    const comment = await this.commentsRepository.findOne({
      where:{
        id,
      }
    });
    if(!comment){
      throw new BadRequestException(`id: ${id}에 해당하는 Comment는 없습니다.`);
    }
    await this.commentsRepository.delete(id);
    return id;
  }
}
