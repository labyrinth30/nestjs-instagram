import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { UsersService } from '../users/users.service';
import { UsersModel } from '../users/entities/users.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CommonModule } from '../common/common.module';
import { CommonService } from '../common/common.service';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { POST_IMAGE_FOLDER_PATH } from '../common/const/path.const';
import { v4 as uuid} from 'uuid';

@Module({
  imports: [TypeOrmModule.forFeature([
    PostsModel, UsersModel,
  ]),
    CommonModule,
    MulterModule.register({
      limits: {
        // 바이트 단위로 입력
        fileSize: 10000000,
      },
      fileFilter: (req, file, callback) => {
        /**
         * callback(에러, boolean)
         *
         * 첫 번째 파라미터에는 에러가 있을 경우 에러 정보를 넣어준다.
         * 두 번째 파라미터는 파일을 받을지 말지 boolean을 넣어준다.
         */
          /// xxx.jpg -> .jpg
        const extension = extname(file.originalname);
        if(extension !== '.jpg' && extension !== '.png' && extension !== '.jpeg') {
          return callback(
            new BadRequestException('jpg, png, jpeg 파일만 업로드 가능합니다.'),
            false,
          );
        }
        return callback(null, true);
      },
      storage: multer.diskStorage({
        destination: function(req, file, callback){
          callback(null, POST_IMAGE_FOLDER_PATH);
        },
        filename: function(req, file, callback){
          // 123123-adfkjldj-dafj12.jpg로 저장되게끔
          callback(null, `${uuid()}${extname(file.originalname)}`);
        }
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService, UsersService, AuthService, JwtService,CommonService],
})
export class PostsModule {}
