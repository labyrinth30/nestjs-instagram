import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';



@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>
  ) {}
  async getAllPosts()  {
    return this.postsRepository.find({
      relations: ['author'],
    });
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      relations: ['author'],
      where: {
        id,
      }
    });
    if(!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    // 1) create -> 저장할 객체를 생성한다.
    // 2) save -> 저장할 객체를 저장한다. (create 메서드에서 생성한 객체로)
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);
    return newPost;
  }
  async updatePost(
    postId: number,
    postDto: UpdatePostDto
  ) : Promise<PostsModel>    {
    // save의 기능
    // 1) 만약에 데이터가 존재하지 않는다면(id 기준으로)
    // 2) 새로운 데이터를 생성한다.
    // 3) 만약에 데이터가 존재한다면(id 기준으로)
    // 4) 기존의 데이터를 수정한다.
    const { title, content } = postDto;
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      }
    })
    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }

    if(title) {
      post.title = title;
    }
    if(content) {
      post.content = content;
    }
    const newPost = await this.postsRepository.save(post);
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
