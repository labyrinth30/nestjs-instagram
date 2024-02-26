import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { RolesEnum } from '../../users/const/roles.const';
import { PostsService } from '../posts.service';
import { UsersModel } from '../../users/entity/users.entity';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(
    private readonly postsService: PostsService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {user: UsersModel};
    const user = req.user;

    if(!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }
    /**
     * 1. 사용자가 관리자인 경우
     * 2. 사용자가 게시물의 작성자인 경우
     */
    if(user.role === RolesEnum.ADMIN) {
      return true;
    }
    const postId = req.params.postId;

    if(!postId) {
      throw new BadRequestException(
        'Post Id가 파라미터로 제공되어야 합니다.'
      );
    }

    const result = await this.postsService.isPostMine(
      user.id,
      parseInt(postId),
    );
      if(!result){
        throw new ForbiddenException('게시물에 대한 권한이 없습니다.');
      }
      return true;
  }
}