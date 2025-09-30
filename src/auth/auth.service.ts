import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/signin.dto';
import { RegisterUserDto } from './dto/register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/users.schema';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  async signIn(signInDto: SignInDto) {
    try {
      const { email, password } = signInDto;
      const user = await this.userModel.findOne({ email });
      if (!user) throw new NotFoundException();
      let isValidPassword = await bcrypt.compare(password, user['password']);
      const {
        password: _,
        isAdmin: __,
        __v: ___,
        ...sanitizedUser
      } = user.toObject();
      if (isValidPassword) {
        const token = await this.jwtService.signAsync({
          sub: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
        });

        return { token, user: sanitizedUser };
      } else {
        throw new BadRequestException('Invalid credentials');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'An error occurred',
      );
    }
  }
  async registerUser(registerUserDto: RegisterUserDto) {
    try {
      const { email, password, firstName, lastName, isAdmin } = registerUserDto;
      const user = await this.userModel.findOne({ email });
      if (user)
        throw new BadRequestException(
          'This email is already associated with another account.',
        );
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await this.userModel.create({
        ...registerUserDto,
        password: hashedPassword,
      });
      const {
        __v: _,
        _id: __,
        password: ___,
        ...sanitizedUser
      } = newUser.toObject();
      return sanitizedUser;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'An error occurred',
      );
    }
  }
}
