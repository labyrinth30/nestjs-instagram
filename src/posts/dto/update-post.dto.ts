import { CreatePostDto } from './create-post.dto';
import { IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;
}