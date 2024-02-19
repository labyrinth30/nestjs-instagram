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
import { AuthModule } from '../auth/auth.module';
import { ImageModel } from '../common/entity/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    PostsModel, UsersModel, ImageModel,
  ]),
    CommonModule,
    AuthModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, UsersService, AuthService, JwtService,CommonService],
})
export class PostsModule {}
