import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CheckoutController } from './checkouts.controllers';
import { CheckoutService } from './checkouts.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { QueryCheckoutDto } from './dto/query-checkout.dto';
import { AdminGuard } from 'src/guards/admin-guard';

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let service: CheckoutService;

  const mockCheckoutService = {
    getCheckouts: jest.fn(),
    getCheckoutByBookId: jest.fn(),
    create: jest.fn(),
    returnBook: jest.fn(),
  };

  const mockAdminGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockCheckout = {
    _id: '507f1f77bcf86cd799439012',
    borrowedAt: new Date('2023-01-01'),
    returnedAt: undefined,
    user: '507f1f77bcf86cd799439013',
    book: '507f1f77bcf86cd799439011',
  };

  const mockReturnedCheckout = {
    ...mockCheckout,
    returnedAt: new Date('2023-01-15'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        {
          provide: CheckoutService,
          useValue: mockCheckoutService,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<CheckoutController>(CheckoutController);
    service = module.get<CheckoutService>(CheckoutService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCheckouts', () => {
    it('should return an array of checkouts with query parameters', async () => {
      const queryCheckoutDto: QueryCheckoutDto = {
        user: '507f1f77bcf86cd799439013',
        borrowedAt: new Date('2023-01-01'),
      };
      const expectedCheckouts = [mockCheckout];
      mockCheckoutService.getCheckouts.mockResolvedValue(expectedCheckouts);

      const result = await controller.getCheckouts(queryCheckoutDto);

      expect(result).toEqual(expectedCheckouts);
      expect(service.getCheckouts).toHaveBeenCalledWith(queryCheckoutDto);
    });

    it('should return all checkouts when no query parameters provided', async () => {
      const queryCheckoutDto: QueryCheckoutDto = {};
      const expectedCheckouts = [mockCheckout, mockReturnedCheckout];
      mockCheckoutService.getCheckouts.mockResolvedValue(expectedCheckouts);

      const result = await controller.getCheckouts(queryCheckoutDto);

      expect(result).toEqual(expectedCheckouts);
      expect(service.getCheckouts).toHaveBeenCalledWith(queryCheckoutDto);
    });

  });

  describe('getCheckoutByBookId', () => {
    it('should return checkout by book id', async () => {
      mockCheckoutService.getCheckoutByBookId.mockResolvedValue(mockCheckout);

      const result = await controller.getCheckoutByBookId(
        '507f1f77bcf86cd799439011',
      );

      expect(result).toEqual(mockCheckout);
      expect(service.getCheckoutByBookId).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw BadRequestException for invalid book id', async () => {
      await expect(
        controller.getCheckoutByBookId('invalid-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createCheckout', () => {
    it('should create a new checkout', async () => {
      const createCheckoutDto: CreateCheckoutDto = {
        borrowedAt: new Date('2023-01-01'),
        user: '507f1f77bcf86cd799439013',
        book: '507f1f77bcf86cd799439011',
      };
      mockCheckoutService.create.mockResolvedValue(mockCheckout);

      const result = await controller.createCheckout(createCheckoutDto);

      expect(result).toEqual(mockCheckout);
      expect(service.create).toHaveBeenCalledWith(createCheckoutDto);
    });
  });

  describe('update', () => {
    it('should return a book (mark as returned)', async () => {
      mockCheckoutService.returnBook.mockResolvedValue(mockReturnedCheckout);

      const result = await controller.update('507f1f77bcf86cd799439012');

      expect(result).toEqual(mockReturnedCheckout);
      expect(service.returnBook).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
      );
    });
  });
});
