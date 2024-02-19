import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from '../common/common.service';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from '../common/const/env-keys.const';
import { ConfigService } from '@nestjs/config';
import { join, basename } from 'path';
import { POST_IMAGE_PATH, PUBLIC_FOLDER_PATH, TEMP_FOLDER_PATH } from '../common/const/path.const';
import { promises } from 'fs';


@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
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
  async createPostImage(dto: CreatePostDto){
    // dto의 이미지 이름을 기반으로
    // 파일의 경로를 생성한다.
    const tempFilePath = join(
      TEMP_FOLDER_PATH,
      dto.image,
    );
    try{
      // 파일이 존재하는 지 확인
      // 파일이 존재하지 않는다면 에러를 발생시킨다.
      await promises.access(tempFilePath);
    }catch{
      throw new BadRequestException('존재하지 않는 파일입니다.');
    }

    // 파일의 이름만 가져오기
    // /Users/aaa/bbb/ccc.jpg -> ccc.jpg
    const fileName = basename(tempFilePath);

    // 새로 이동할 포스트 폴더의 경로 + 이미지 이름
    // {프로젝트 경로}/public/posts/{이미지 이름}
    const newFilePath = join(
      POST_IMAGE_PATH,
      fileName,
    );
    // 파일 옮기기
    await promises.rename(tempFilePath, newFilePath);
    return true;
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

    const PROTOCOL = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const HOST = this.configService.get<string>(ENV_HOST_KEY);

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
