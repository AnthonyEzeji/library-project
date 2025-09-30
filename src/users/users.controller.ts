import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './users.service';
import { isValidObjectId } from 'mongoose';
import { AdminGuard } from 'src/guards/admin-guard';
@UseGuards(AdminGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAll() {
    return this.userService.getAll();
  }
  @Get(':id')
  async getById(@Param('id') id: string) {
    const isValid = isValidObjectId(id);
    if (!isValid) return new BadRequestException('Invalid ID');
    const user = await this.userService.getById(id);
    if (!user) return new NotFoundException('User not found.');
    return user;
  }
}
