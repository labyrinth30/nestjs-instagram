import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageModel } from '../../common/entity/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreatePostImageDto } from './dto/create-image.dto';
import { basename, join } from 'path';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from '../../common/const/path.const';
import { promises } from 'fs';

@Injectable()
export class PostsImagesService{
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}


    getRepository(qr?: QueryRunner){
      if(qr){
        return qr.manager.getRepository<ImageModel>(ImageModel);
      }
      return this.imageRepository;
    }
    async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner){
    const repository = this.getRepository(qr);
// dto의 이미지 이름을 기반으로
      // 파일의 경로를 생성한다.
      const tempFilePath = join(
        TEMP_FOLDER_PATH,
        dto.path,
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
      // save
      const result = await repository.save({
        ...dto,
      });
      // 파일 옮기기
      await promises.rename(tempFilePath, newFilePath);
      return result;
    }
  }
