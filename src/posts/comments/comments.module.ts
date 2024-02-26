import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommentsModel } from './entity/comments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([CommentsModel]),
    CommonModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
