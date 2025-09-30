import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

import { RegisterUserDto } from './dto/register.dto';
import { SignInDto } from './dto/signin.dto';
import { AdminGuard } from 'src/guards/admin-guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
  @UseGuards(AdminGuard)
  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }
}
