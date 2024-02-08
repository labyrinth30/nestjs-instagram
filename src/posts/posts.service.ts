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
  getAllPosts(): PostModel[] {
    return posts;
  }

  getPostById(id: number): PostModel {
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return post;
  }

  createPost(author: string, title: string, content: string) {
    const post: PostModel = {
      id: posts[posts.length - 1].id + 1,
      author: author,
      title: title,
      content: content,
      likeCount: 0,
      commentCount: 0,
    };
    posts = [...posts, post];
    return post;
  }

  updatePost(
    postId: number,
    author?: string,
    title?: string,
    content?: string,
  ) {
    const post = posts.find((post) => post.id === postId);
    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    if (author) {
      post.author = author;
    }
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }
    posts = posts.map((prevPost) => (prevPost.id === postId ? post : prevPost));
    return post;
  }

  deletePost(postId: number) {
    const post = posts.find((post) => post.id === postId);
    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    posts = posts.filter((post) => post.id !== postId);
    return postId;
  }
}
