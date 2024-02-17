import { PickType } from '@nestjs/swagger';
import { UsersModel } from '../../users/entities/users.entity';

export class RegisterUserDto extends PickType(UsersModel, ['email', 'password', 'nickname']){s}