import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { PostsService } from './posts.service';


interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts : PostModel[] = [
  {
    id: 1,
    author: 'newjeans_offical',
    title: '뉴진스 민지',
    content: '메이크업 고치고 있는 민지.',
    likeCount: 100,
    commentCount: 150,
  },
  {
    id: 2,
    author: 'newjeans_offical2',
    title: '뉴진스 해린',
    content: '춤 추고 있는 해린.',
    likeCount: 100,
    commentCount: 150,
  },
  {
    id: 3,
    author: 'newjeans_offical3',
    title: '뉴진스 하니',
    content: '노래 부르고 있는 하니.',
    likeCount: 100,
    commentCount: 150,
  },
];

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}


  // 1) GET /posts
  // 모든 게시물을 조회하는 API
  @Get()
  getPosts() : PostModel[]{
    return posts;
  }

  // 2) GET /posts/:id
  // 아이디에 해당되는 특정 게시물을 조회하는 API
  @Get(':id')
  getPost(@Param('id') id: string) : PostModel{
    const post = posts.find((post) => post.id === +id );

    if(!post){
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return post;
    
  }

  // 3) POST /posts
  // 새로운 게시물을 생성하는 API
  @Post()
  postPosts(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ){
    const post: PostModel = {
      id: posts[posts.length - 1].id + 1,
      author: author,
      title: title,
      content: content,
      likeCount: 0,
      commentCount: 0,
    }
    posts = [
      ...posts,
      post,
    ]
    return post;
  }

  // 4) PATCH /posts/:id
  // 아이디에 해당되는 특정 게시물을 수정하는 API
  @Patch(':id')
  patchPost(
    @Param('id') id: string,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ){
    const post = posts.find((post) => post.id === +id );
    if(!post){
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    if(author){
      post.author = author;
    }
    if(title){
      post.title = title;
    }
    if(content){
      post.content = content;
    }
    posts = posts.map(prevPost => prevPost.id === +id ? post : prevPost);
    return post;
  }

  // 5) DELETE /posts/:id
  // 아이디에 해당되는 특정 게시물을 삭제하는 API
  @Delete(':id')
  deletePost(@Param('id') id: string){
    const post = posts.find((post) => post.id === +id );
    if(!post){
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    posts = posts.filter((post) => post.id !== +id);
    return id;
  }
  
}
