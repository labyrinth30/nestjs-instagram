import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './entities/create-user.dto';
import { CreateProfileImageDto } from './image/dto/create-profile-image.dto';
import { join } from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {
  }

  async createUser(dto: CreateUserDto) {
    // 1) 닉네임 중복이 없는지 확인
    // exist() -> 만약에 조건에 해당하는 데이터가 존재한다면 true, 아니면 false
    const nicknameExist = await this.usersRepository.exists({
      where: {
        nickname: dto.nickname,
      }
    });

    if(nicknameExist) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }

    // 2) 이메일 중복이 없는지 확인
    const emailExist = await this.usersRepository.exists({
      where: {
        email: dto.email,
      }
    });
    if(emailExist) {
      throw new BadRequestException('이미 가입한 이메일입니다.');
    }

    const userObject = this.usersRepository.create({
      email: dto.email,
      nickname: dto.nickname,
      password: dto.password,
    });
    const newUser = await this.usersRepository.save(userObject);

    return newUser;
  }

  async getAllUsers() {
    return this.usersRepository.find();
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email,
      }
    });
  }


}