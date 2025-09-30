import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminGuard } from 'src/guards/admin-guard';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    createUser: jest.fn(),
  };

  const mockAdminGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [mockUser];
      mockUserService.getAll.mockResolvedValue(expectedUsers);

      const result = await controller.getAll();

      expect(result).toEqual(expectedUsers);
      expect(service.getAll).toHaveBeenCalled();
    });

  });

  describe('getById', () => {
    it('should return a user by id', async () => {
      mockUserService.getById.mockResolvedValue(mockUser);

      const result = await controller.getById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(service.getById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return BadRequestException for invalid id', async () => {
      const result = await controller.getById('invalid-id');
      expect(result).toBeInstanceOf(BadRequestException);
    });

    it('should return NotFoundException when user not found', async () => {
      mockUserService.getById.mockResolvedValue(null);

      const result = await controller.getById('507f1f77bcf86cd799439011');

      expect(result).toBeInstanceOf(NotFoundException);
      expect(service.getById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

  });

});
