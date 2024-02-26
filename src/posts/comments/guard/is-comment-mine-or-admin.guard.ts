import {
  BadRequestException, CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PostsService } from '../../posts.service';
import { CommentsService } from '../comments.service';
import { Request } from 'express';
import { UsersModel } from '../../../users/entity/users.entity';
import { RolesEnum } from '../../../users/const/roles.const';

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate{
  constructor(
    private readonly commentsService: CommentsService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & { user: UsersModel };
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    /**
     * 1. 사용자가 관리자인 경우
     * 2. 사용자가 댓글의 작성자인 경우
     */
    // 1번
    if (user.role === RolesEnum.ADMIN) {
      return true;
    }
    // 2번
    const commentId = req.params.commentId;
    if (!commentId) {
      throw new BadRequestException(
        'Comment Id가 파라미터로 제공되어야 합니다.'
      );
    }
    const result: boolean = await this.commentsService.isCommentMine(
      user.id,
      parseInt(commentId),
    )
    if (!result) {
      throw new ForbiddenException('댓글에 대한 권한이 없습니다.');
    }
    return true;
  }
}