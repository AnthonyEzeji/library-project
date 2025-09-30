import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from './admin-guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    guard = new AdminGuard();
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when user is admin', () => {
      const mockRequest = {
        user: {
          _id: '507f1f77bcf86cd799439011',
          email: 'admin@example.com',
          isAdmin: true,
        },
      };
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when user is not admin', () => {
      const mockRequest = {
        user: {
          _id: '507f1f77bcf86cd799439011',
          email: 'user@example.com',
          isAdmin: false,
        },
      };
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is not present', () => {
      const mockRequest = {
        user: null,
      };
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is undefined', () => {
      const mockRequest = {};
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with correct message', () => {
      const mockRequest = {
        user: {
          _id: '507f1f77bcf86cd799439011',
          email: 'user@example.com',
          isAdmin: false,
        },
      };
      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('Admin access required'),
      );
    });
  });
});