import { PickType } from '@nestjs/mapped-types';
import { CommentsModel } from '../entity/comments.entity';
import { PartialType } from '@nestjs/swagger';
import { CreateCommentsDto } from './create-comments.dto';

export class UpdateCommentsDto extends PartialType(CreateCommentsDto) {}