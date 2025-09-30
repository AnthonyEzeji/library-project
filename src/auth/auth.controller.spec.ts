import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { SignInDto } from './dto/signin.dto';
import { AdminGuard } from 'src/guards/admin-guard';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
    registerUser: jest.fn(),
  };

  const mockAdminGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should sign in a user and return token and user data', async () => {
      const signInDto: SignInDto = {
        email: 'john.doe@example.com',
        password: 'password123',
      };
      const expectedResponse = {
        token: 'jwt-token',
        user: {
          _id: '507f1f77bcf86cd799439011',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      };
      mockAuthService.signIn.mockResolvedValue(expectedResponse);

      const result = await controller.signIn(signInDto);

      expect(result).toEqual(expectedResponse);
      expect(service.signIn).toHaveBeenCalledWith(signInDto);
    });
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const registerUserDto: RegisterUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        isAdmin: false,
      };
      const expectedResponse = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        isAdmin: false,
      };
      mockAuthService.registerUser.mockResolvedValue(expectedResponse);

      const result = await controller.registerUser(registerUserDto);

      expect(result).toEqual(expectedResponse);
      expect(service.registerUser).toHaveBeenCalledWith(registerUserDto);
    });

  });
});
