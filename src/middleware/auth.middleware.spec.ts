import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { ValidateTokenMiddleware } from './auth.middleware';

describe('ValidateTokenMiddleware', () => {
  let middleware: ValidateTokenMiddleware;
  let jwtService: JwtService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateTokenMiddleware,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    middleware = module.get<ValidateTokenMiddleware>(ValidateTokenMiddleware);
    jwtService = module.get<JwtService>(JwtService);

    mockRequest = {
      headers: {},
    };
    mockResponse = {
      sendStatus: jest.fn(),
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should call next() when valid token is provided', async () => {
      const verifiedPayload = {
        sub: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        isAdmin: false,
      };
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };
      mockJwtService.verifyAsync.mockResolvedValue(verifiedPayload);

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(mockRequest['user']).toEqual(verifiedPayload);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.sendStatus).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is missing', async () => {
      mockRequest.headers = {};

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should return 401 when token verification fails', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token');
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle token with extra whitespace', async () => {
      const verifiedPayload = {
        sub: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        isAdmin: true,
      };
      mockRequest.headers = {
        authorization: 'Bearer token-with-spaces',
      };
      mockJwtService.verifyAsync.mockResolvedValue(verifiedPayload);

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('token-with-spaces');
      expect(mockRequest['user']).toEqual(verifiedPayload);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should attach user payload to request', async () => {
      const verifiedPayload = {
        sub: '507f1f77bcf86cd799439011',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true,
      };
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };
      mockJwtService.verifyAsync.mockResolvedValue(verifiedPayload);

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest['user']).toEqual(verifiedPayload);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});