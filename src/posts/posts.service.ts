import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { HOST, PROTOCOL } from '../common/const/env.const';
import { CommonService } from '../common/common.service';



@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
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

  async paginatePosts(dto: PaginatePostDto){
    // if(dto.page){
    //   return this.pagePaginatePosts(dto);
    // } else{
    //   return this.cursorPaginatePosts(dto);
    // }
    return this.commonService.paginate(dto, this.postsRepository, {
      relations: ['author'],
    }, 'posts');
  }
  async pagePaginatePosts(dto: PaginatePostDto){
    /**
     * data: Data[],
     * total: number,
     * next는 필요없다.
     * [1] [2] [3]
     */
    const [posts, count] = await this.postsRepository.findAndCount({
      skip: (dto.page - 1) * dto.take,
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt,

      }});
    return {
      data: posts,
      total: count,
    }
  }

  async cursorPaginatePosts(dto: PaginatePostDto){
    const where : FindOptionsWhere<PostsModel> = {};
    if(dto.where__id__less_than){
      /**
       * {
       *   id: LessThan(dto.where__id_less_than)
       * }
       */
      where.id = LessThan(dto.where__id__less_than);
    } else if(dto.where__id__more_than){
      where.id = MoreThan(dto.where__id__more_than);
    }

    const posts = await this.postsRepository.find({
      where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });
    /**
     * Response
     *
     * data: Data[],
     * cursor: {
     *   after: 마지막 Data의 ID,
     * }
     * count: 응답한 데이터의 갯수
     * next: 다음 요청을 할 때 사용할 URL
     */
      // 해당되는 포스트가 0개 이상이면 마지막 포스트를 가져오고
      // 0개라면 null을 반환한다.
      // 반환된 post가 기본값 20개보다 작다면 다음 요청을 할 필요가 없다.
    const lastItem = posts.length > 0 && posts.length == dto.take ? posts[posts.length - 1] : null;

    const nextUrl = lastItem &&  new URL(`${PROTOCOL}://${HOST}/posts`);

    if(nextUrl){{
      /**
       * dto의 키값들을 루핑하면서
       * 키값에 해당되는 밸류가 존재하면
       * param에 그대로 붙여넣는다.
       *
       * 단, where__id_more_than 값만 lastItemm의 마지막 값으로 넣어준다
       */
      for(const key of Object.keys(dto)){
        if(dto[key]){
          if(key !== 'where__id_more_than' && key !== 'where__id_less_than'){
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }
      let key = null;

      if(dto.order__createdAt === 'ASC'){
        key = 'where__id_more_than';
      }
      else{
        key = 'where__id_less_than';
      }
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }}

    return {
      data: posts,
      count: posts.length,
      cursor: {
        after: lastItem?.id ?? null,
      },
      next: nextUrl?.toString() ?? null,
    }
  }

  async generatePosts(userId: number){
    for (let i = 0; i< 100; i++){
      await this.createPost(userId, {
        title: `테스트 게시물 ${i}`,
        content: `테스트 게시물 ${i}의 내용`,
      });
    }
  }
}
