import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus, InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../users/decorator/user.decorator';
import { UsersModel } from '../users/entities/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageModelType } from '../common/entity/image.entity';
import { DataSource } from 'typeorm';
import { PostsImagesService } from './image/image.service';


@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService,
              private readonly dataSource: DataSource,
              private readonly postsImagesService: PostsImagesService,
  ) {}

  // 1) GET /posts
  // 모든 게시물을 조회하는 API
  @Get()
  getPosts(
    @Query() query: PaginatePostDto,
  ) {
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
  async postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
    // @Body('title') title: string,
    // @Body('content') content: string,
  ) {
    // 트랜잭션과 관련된 모든 쿼리를 담당할
    // 쿼리 러너를 생성한다.
    const qr = this.dataSource.createQueryRunner();
    // 연결한다.
    await qr.connect();
    // 쿼리 러너에서 트랜잭션을 시작한다.
    // 이 시점부터 같은 쿼리 러너를 사용하면
    // 트랜잭션 안에서 데이터베이스 액션을 실행 할 수 있다.
    // 이 쿼리 러너 안에서 롤백을 하면 이전 상태로 돌아간다.
    // 커밋을 하면 지금까지의 액션을 데이터베이스에 반영된다.
    await qr.startTransaction();
    // 로직 실행시 에러가 발생하면
    // 롤백을 실행한다.
    try {
      const post = await this.postsService.createPost(userId, body, qr);

      // 여기서 에러 발생시 포스트가 생성되면 안 됨.
      // throw new InternalServerErrorException('에러가 생겼습니다.');

      for(let i = 0; i < body.images.length; i++){
        await this.postsImagesService.createPostImage({
          post,
          order: i,
          path: body.images[i],
          type: ImageModelType.POST_IMAGE,
        }, qr);
      }
      // 트랜잭션을 커밋(저장)한다.
      await qr.commitTransaction();
      await qr.release();
      return this.postsService.getPostById(post.id);
    } catch(e){
      // 어떤 에러든 에러가 던져지면
      // 트랜잭션을 종료하고 원래 상태로 되돌린다.
      await qr.rollbackTransaction();
      await qr.release();
      throw new InternalServerErrorException('에러가 생겼습니다.');
    }




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
