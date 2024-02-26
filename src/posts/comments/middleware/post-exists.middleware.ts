import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PostsService } from '../../posts.service';

@Injectable()
export class PostExistsMiddleware implements NestMiddleware {

  constructor(
    private readonly postsService: PostsService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;
    if(!postId){
      throw new BadRequestException('PostId는 필수로 넣어야합니다.');
    }
    const exists = await this.postsService.checkPostExistsById(
      parseInt(postId)
    );
    if(!exists){
      throw new BadRequestException(`id: ${postId}에 해당하는 Post는 없습니다.`);
    }
    next();
  }
}