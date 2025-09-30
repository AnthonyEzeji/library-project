import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from '../schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let model: Model<User>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  };

  const mockUserModel = {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<User>>(getModelToken(User.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUserModel.find.mockResolvedValue(users);

      const result = await service.getAll();

      expect(result).toEqual(users);
      expect(model.find).toHaveBeenCalledWith({});
    });

    it('should throw InternalServerErrorException on error', async () => {
      const error = new Error('Database error');
      mockUserModel.find.mockRejectedValue(error);

      await expect(service.getAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getById', () => {
    it('should return a user by id', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.getById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw InternalServerErrorException on error', async () => {
      const error = new Error('Database error');
      mockUserModel.findById.mockRejectedValue(error);

      await expect(service.getById('507f1f77bcf86cd799439011')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

});
