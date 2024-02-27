import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateProfileImageDto } from './image/dto/create-profile-image.dto';
import { join } from 'path';
import { UserFollowersModel } from './entity/user-followers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  getUsersRepository(qr?: QueryRunner){
    return qr ? qr.manager.getRepository<UsersModel>(UsersModel) : this.usersRepository;
  }

  getUserFollowersRepository(qr?: QueryRunner){
    return qr ? qr.manager.getRepository<UserFollowersModel>(UserFollowersModel) : this.userFollowersRepository;
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

  async followUser(followerId: number, followeeId: number, qr?: QueryRunner): Promise<boolean> {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    // 자기 자신을 팔로우하는 경우
    if(followerId === followeeId) {
      throw new BadRequestException('자기 자신을 팔로우할 수 없습니다.');
    }
    // 이미 팔로우한 경우
    const existing = await userFollowersRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        followee: {
          id: followeeId,
        }
      }
    });
    if(existing){
      throw new BadRequestException('이미 팔로우한 유저입니다.');
    }

  await userFollowersRepository.save({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      }
    });
    return true;
  }

  async getFollowers(
    userId: number,
    includeNotConfirmed: boolean,
  )  {
    /**
     *  [
     *    {
     *      id: number;
     *      isConfirmed: boolean;
     *      follower: UsersModel;
     *      followee: UsersModel;
     *      createdAt: Date;
     *      updatedAt: Date;
     *
     *    }
     *  ]
     */
    const where =  {
      followee: {
        id: userId,
      },
    };
    if(!includeNotConfirmed){
      where['isConfirmed'] = true;
    }
    const result = await this.userFollowersRepository.find({
      where,
      relations: {
        follower: true,
        followee: true,
      },
    });

    return result.map((item) =>( {
      id: item.follower.id,
      nickname: item.follower.nickname,
      email: item.follower.email,
      isConfirmed: item.isConfirmed,
    }));
  }

  async confirmFollow(
    followerId: number,
    followeeId: number,
    qr?: QueryRunner,
  ){
    const userFollowersRepository = this.getUserFollowersRepository(qr);
    const existing = await userFollowersRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        followee: {
          id: followeeId,
        },
      },
      relations: {
        follower: true,
        followee: true,
      }
    })
    if(!existing){
      throw new BadRequestException('팔로우 요청이 존재하지 않습니다.');
    }
    await userFollowersRepository.save({
      ...existing,
      isConfirmed: true,
    });
    return true;
  }

  async deleteFollow(
    followerId: number,
    followeeId: number,
    qr?: QueryRunner,
  ){
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    await userFollowersRepository.delete({
      follower:{
        id: followerId,
      },
      followee: {
        id: followeeId,
      }
    });
    return true;
  }

  async increaseFollowerCount(
    userId: number,
    fieldName: keyof Pick<UsersModel, 'followerCount'| 'followeeCount'>,
    qr?: QueryRunner){
    const usersRepository = this.getUsersRepository(qr);
    await usersRepository.increment(
      {
        id: userId
      },
      fieldName,
      1,
    );
  }

  async decreaseFollowerCount(
    userId: number,
    fieldName: keyof Pick<UsersModel, 'followerCount'| 'followeeCount'>,
    qr?: QueryRunner){
    const usersRepository = this.getUsersRepository(qr);
    await usersRepository.decrement(
      {
        id: userId
      },
      fieldName,
      1
    );
  }


}