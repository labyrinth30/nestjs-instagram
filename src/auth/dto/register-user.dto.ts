import { PickType } from '@nestjs/swagger';
import { UsersModel } from '../../users/entities/users.entity';
import { CreateUserDto } from '../../users/entities/create-user.dto';

export class RegisterUserDto extends CreateUserDto{}