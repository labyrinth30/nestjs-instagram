import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';


@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  // 모든 게시물을 조회하는 API
  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  // 2) GET /posts/:id
  // 아이디에 해당되는 특정 게시물을 조회하는 API
  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.getPostById(+id);
  }

  // 3) POST /posts
  // 새로운 게시물을 생성하는 API
  @Post()
  postPosts(
    @Body('authorId') authorId: number,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.postsService.createPost(authorId, title, content);
  }

  // 4) PATCH /posts/:id
  // 아이디에 해당되는 특정 게시물을 수정하는 API
  @Patch(':id')
  patchPost(
    @Param('id') id: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(+id, title, content);
  }

  // 5) DELETE /posts/:id
  // 아이디에 해당되는 특정 게시물을 삭제하는 API
  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(+id);
  }
}
