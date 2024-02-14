import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entities/posts.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entities/users.entity';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    PostsModule,
    UsersModule,
    TypeOrmModule.forRoot({
      // 데이터베이스 타입
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [
        PostsModel,
        UsersModel,
      ],
      synchronize: true,
    }),
    AuthModule,
    CommonModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
