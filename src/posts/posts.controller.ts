import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile, UseFilters,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../users/decorator/user.decorator';
import { UsersModel } from '../users/entities/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageModelType } from '../common/entity/image.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { PostsImagesService } from './image/image.service';
import { LogInterceptor } from '../common/interceptor/log.interceptor';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { HttpExceptionFilter } from '../common/interceptor/http.exception-filter';


@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService,
              private readonly dataSource: DataSource,
              private readonly postsImagesService: PostsImagesService,
  ) {}

  // 1) GET /posts
  // 모든 게시물을 조회하는 API
  @Get()
  @UseFilters(HttpExceptionFilter)
  @UseInterceptors(LogInterceptor)
  getPosts(
    @Query() query: PaginatePostDto,
  ) {
    // 에러 테스트해보기
    throw new BadRequestException('에러가 발생했습니다.');
    return this.postsService.paginatePosts(query);
  }


  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User() user: UsersModel){
    await this.postsService.generatePosts(user.id);
    return true;
  }


  // 2) GET /posts/:id
  // 아이디에 해당되는 특정 게시물을 조회하는 API
  @Get(':id')
  getPost(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE})) id: number) {
    return this.postsService.getPostById(id);
  }

  // 3) POST /posts
  // 새로운 게시물을 생성하는 API
  //
  // DTO - Data Transfer Object
  // A Model, B Model
  // Post API -> A 모델을 저장하고, B 모델을 저장한다.
  // await repository.save(a);
  // await repository.save(b);
  //
  // 만약 a를 저장하다가 실패하면 b를 저장하면 안될경우
  // 트랜잭션이란 all or nothing을 보장하는 것이다.
  //
  // transaction
  // start -> 시작
  // commit -> 저장
  // rollback -> 원상복구
  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
    @QueryRunner() qr?: QR,
  ) {
      // 로직 실행
      const post = await this.postsService.createPost(userId, body, qr);
      // throw new Error('에러가 발생했습니다.');
      for(let i = 0; i < body.images.length; i++){
        await this.postsImagesService.createPostImage({
          post,
          order: i,
          path: body.images[i],
          type: ImageModelType.POST_IMAGE,
        }, qr);
      }
      return this.postsService.getPostById(post.id, qr);
  }

  // 4) PATCH /posts/:id
  // 아이디에 해당되는 특정 게시물을 수정하는 API
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
    // @Body('title') title?: string,
    // @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, body);
  }

  // 5) DELETE /posts/:id
  // 아이디에 해당되는 특정 게시물을 삭제하는 API
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
