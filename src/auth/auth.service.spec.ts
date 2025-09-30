import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { User } from 'src/schemas/users.schema';
import { SignInDto } from './dto/signin.dto';
import { RegisterUserDto } from './dto/register.dto';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userModel: any;

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUserObject = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword123',
    isAdmin: false,
    __v: 0,
  };

  const mockUser = {
    ...mockUserObject,
    toObject: jest.fn(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userModel = module.get(getModelToken(User.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should sign in a user with valid credentials', async () => {
      const signInDto: SignInDto = {
        email: 'john.doe@example.com',
        password: 'password123',
      };
      const sanitizedUser = {
        _id: '507f1f77bcf86cd799439011',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };
      mockUser.toObject.mockReturnValue(mockUserObject);
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.signIn(signInDto);

      expect(result).toEqual({
        token: 'jwt-token',
        user: sanitizedUser,
      });
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: signInDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser._id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        isAdmin: mockUser.isAdmin,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const signInDto: SignInDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: signInDto.email,
      });
    });

    it('should throw InternalServerErrorException for invalid password', async () => {
      const signInDto: SignInDto = {
        email: 'john.doe@example.com',
        password: 'wrongpassword',
      };
      mockUser.toObject.mockReturnValue(mockUserObject);
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      );
    });
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const registerUserDto: RegisterUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        isAdmin: false,
      };
      const newUser = {
        ...registerUserDto,
        _id: '507f1f77bcf86cd799439012',
        password: 'hashedPassword',
        __v: 0,
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439012',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          password: 'hashedPassword',
          isAdmin: false,
          __v: 0,
        }),
      };
      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserModel.create.mockResolvedValue(newUser);

      const result = await service.registerUser(registerUserDto);

      expect(result).toEqual({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        isAdmin: false,
      });
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: registerUserDto.email,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerUserDto.password, 10);
      expect(userModel.create).toHaveBeenCalledWith({
        ...registerUserDto,
        password: 'hashedPassword',
      });
    });

    it('should throw BadRequestException when email already exists', async () => {
      const registerUserDto: RegisterUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'existing@example.com',
        password: 'password123',
        isAdmin: false,
      };
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.registerUser(registerUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: registerUserDto.email,
      });
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const registerUserDto: RegisterUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        isAdmin: false,
      };
      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing error'));

      await expect(service.registerUser(registerUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
