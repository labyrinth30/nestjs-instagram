import { PickType } from '@nestjs/swagger';
import { UsersModel } from '../../users/entity/users.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterUserDto extends CreateUserDto{}