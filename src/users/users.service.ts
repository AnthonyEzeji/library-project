import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async getAll() {
    try {
      return await this.userModel.find({});
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'An error occurred',
      );
    }
  }
  async getById(id: string) {
    try {
      return await this.userModel.findById(id);
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'An error occurred',
      );
    }
  }
  async createUser(createUserDto: CreateUserDto) {
    try {
      return await this.userModel.create(createUserDto);
    } catch (err) {
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'An error occurred',
      );
    }
  }
}
