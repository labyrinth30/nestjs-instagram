import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';

export interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
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

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>
  ) {}
  async getAllPosts()  {
    return this.postsRepository.find();
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      }
    });
    if(!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return post;
  }

  async createPost(author: string, title: string, content: string) {
    // 1) create -> 저장할 객체를 생성한다.
    // 2) save -> 저장할 객체를 저장한다. (create 메서드에서 생성한 객체로)
    const post = this.postsRepository.create({
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);
    return newPost;
  }
  async updatePost(
    postId: number,
    author?: string,
    title?: string,
    content?: string,
  ) : Promise<PostModel>    {
    // save의 기능
    // 1) 만약에 데이터가 존재하지 않는다면(id 기준으로)
    // 2) 새로운 데이터를 생성한다.
    // 3) 만약에 데이터가 존재한다면(id 기준으로)
    // 4) 기존의 데이터를 수정한다.
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      }
    })
    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    if(author) {
      post.author = author;
    }
    if(title) {
      post.title = title;
    }
    if(content) {
      post.content = content;
    }
    const newPost:PostModel =await this.postsRepository.save(post);
    return newPost;
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({
    where: {
      id: postId,
    }
  });
  if (!post) {
    throw new NotFoundException('게시물을 찾을 수 없습니다.');
  }

  await this.postsRepository.delete(postId);

  return postId;
  }
}
