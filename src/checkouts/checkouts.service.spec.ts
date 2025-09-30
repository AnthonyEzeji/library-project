import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CheckoutService } from './checkouts.service';
import { Checkout } from '../schemas/checkouts.schema';
import { Book } from '../schemas/books.schema';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let checkoutModel: Model<Checkout>;
  let bookModel: Model<Book>;

  const mockCheckout = {
    _id: '507f1f77bcf86cd799439012',
    borrowedAt: new Date('2023-01-01'),
    returnedAt: undefined,
    user: '507f1f77bcf86cd799439013',
    book: '507f1f77bcf86cd799439011',
    save: jest.fn(),
  };

  const mockBook = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Book',
    author: 'Test Author',
    status: 'AVAILABLE',
  };

  const mockCheckoutModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockBookModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: getModelToken(Checkout.name),
          useValue: mockCheckoutModel,
        },
        {
          provide: getModelToken(Book.name),
          useValue: mockBookModel,
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    checkoutModel = module.get<Model<Checkout>>(getModelToken(Checkout.name));
    bookModel = module.get<Model<Book>>(getModelToken(Book.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('returnBook', () => {
    it('should return a book successfully', async () => {
      const updatedCheckout = { ...mockCheckout, returnedAt: new Date() };
      mockCheckout.save.mockResolvedValue(updatedCheckout);
      mockCheckoutModel.findById.mockResolvedValue(mockCheckout);
      mockBookModel.findByIdAndUpdate.mockResolvedValue(mockBook);

      const result = await service.returnBook('507f1f77bcf86cd799439012');

      expect(result).toBeDefined();
      expect(checkoutModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
      );
      expect(bookModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockCheckout.book,
        {
          status: 'AVAILABLE',
        },
      );
    });

    it('should throw NotFoundException when checkout not found', async () => {
      mockCheckoutModel.findById.mockResolvedValue(null);

      await expect(
        service.returnBook('507f1f77bcf86cd799439012'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when book already returned', async () => {
      const returnedCheckout = { ...mockCheckout, returnedAt: new Date() };
      mockCheckoutModel.findById.mockResolvedValue(returnedCheckout);

      await expect(
        service.returnBook('507f1f77bcf86cd799439012'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const error = new Error('Database error');
      mockCheckoutModel.findById.mockRejectedValue(error);

      await expect(
        service.returnBook('507f1f77bcf86cd799439012'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('create', () => {
    it('should create a checkout successfully', async () => {
      const createCheckoutDto: CreateCheckoutDto = {
        borrowedAt: new Date('2023-01-01'),
        user: '507f1f77bcf86cd799439013',
        book: '507f1f77bcf86cd799439011',
      };

      mockBookModel.findById.mockResolvedValue(mockBook);
      mockBookModel.findByIdAndUpdate.mockResolvedValue(mockBook);
      mockCheckoutModel.create.mockResolvedValue(mockCheckout);

      const result = await service.create(createCheckoutDto);

      expect(result).toEqual(mockCheckout);
      expect(bookModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(bookModel.findByIdAndUpdate).toHaveBeenCalledWith(mockBook._id, {
        status: 'UNAVAILABLE',
      });
    });

    it('should throw BadRequestException when book is not available', async () => {
      const createCheckoutDto: CreateCheckoutDto = {
        borrowedAt: new Date('2023-01-01'),
        user: '507f1f77bcf86cd799439013',
        book: '507f1f77bcf86cd799439011',
      };

      const unavailableBook = { ...mockBook, status: 'UNAVAILABLE' };
      mockBookModel.findById.mockResolvedValue(unavailableBook);

      await expect(service.create(createCheckoutDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when book not found', async () => {
      const createCheckoutDto: CreateCheckoutDto = {
        borrowedAt: new Date('2023-01-01'),
        user: '507f1f77bcf86cd799439013',
        book: '507f1f77bcf86cd799439011',
      };

      mockBookModel.findById.mockResolvedValue(null);

      await expect(service.create(createCheckoutDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const createCheckoutDto: CreateCheckoutDto = {
        borrowedAt: new Date('2023-01-01'),
        user: '507f1f77bcf86cd799439013',
        book: '507f1f77bcf86cd799439011',
      };

      const error = new Error('Database error');
      mockBookModel.findById.mockRejectedValue(error);

      await expect(service.create(createCheckoutDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getCheckoutByBookId', () => {
    it('should return checkout by book id', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockCheckout),
      };
      mockCheckoutModel.findOne.mockReturnValue(mockQuery);

      const result = await service.getCheckoutByBookId(
        '507f1f77bcf86cd799439011',
      );

      expect(result).toEqual(mockCheckout);
      expect(checkoutModel.findOne).toHaveBeenCalledWith({
        book: '507f1f77bcf86cd799439011',
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ borrowedAt: -1 });
      expect(mockQuery.populate).toHaveBeenCalledWith('book');
    });

    it('should throw NotFoundException when checkout not found', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(null),
      };
      mockCheckoutModel.findOne.mockReturnValue(mockQuery);

      await expect(
        service.getCheckoutByBookId('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const error = new Error('Database error');
      mockCheckoutModel.findOne.mockImplementation(() => {
        throw error;
      });

      await expect(
        service.getCheckoutByBookId('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
