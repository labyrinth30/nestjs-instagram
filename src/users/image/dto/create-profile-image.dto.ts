import { IsString } from 'class-validator';
import { ImageModel } from '../../../common/entity/image.entity';
import { PickType } from "@nestjs/mapped-types";

export class CreateProfileImageDto extends PickType(ImageModel, [
  'path',
  'user',
  'type',
]){}