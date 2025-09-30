import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from '../schemas/books.schema';
import { CreateBook } from './dto/create-book.dto';
import { UpdateBook } from './dto/update-book.dto';
import { QueryBook } from './dto/query-book.dto';

describe('BooksService', () => {
  let service: BooksService;
  let model: Model<Book>;

  const mockBook = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Book',
    author: 'Test Author',
    genre: 'Fiction',
    pages: 300,
    yearPublished: 2023,
    isbn13: 9781234567890,
    status: 'AVAILABLE',
  };

  const mockBookModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    skip: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getModelToken(Book.name),
          useValue: mockBookModel,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    model = module.get<Model<Book>>(getModelToken(Book.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllBooks', () => {
    it('should return all books with filters', async () => {
      const query: QueryBook = { author: 'Test Author', limit: 10 };
      const books = [mockBook];

      const mockQuery = {
        skip: jest.fn().mockResolvedValue(books),
      };
      mockBookModel.find.mockReturnValue(mockQuery);

      const result = await service.getAllBooks(query);

      expect(result).toEqual(books);
      expect(model.find).toHaveBeenCalledWith({ author: 'Test Author' });
      expect(mockQuery.skip).toHaveBeenCalledWith(10);
    });

    it('should return all books without filters', async () => {
      const query: QueryBook = {};
      const books = [mockBook];

      const mockQuery = {
        skip: jest.fn().mockResolvedValue(books),
      };
      mockBookModel.find.mockReturnValue(mockQuery);

      const result = await service.getAllBooks(query);

      expect(result).toEqual(books);
      expect(model.find).toHaveBeenCalledWith({});
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
    });

    it('should throw InternalServerErrorException on error', async () => {
      const query: QueryBook = {};
      const error = new Error('Database error');
      mockBookModel.find.mockImplementation(() => {
        throw error;
      });

      await expect(service.getAllBooks(query)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getBookById', () => {
    it('should return a book by id', async () => {
      mockBookModel.findById.mockResolvedValue(mockBook);

      const result = await service.getBookById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockBook);
      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw InternalServerErrorException on error', async () => {
      const error = new Error('Database error');
      mockBookModel.findById.mockRejectedValue(error);

      await expect(
        service.getBookById('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('createBook', () => {
    it('should create a book', async () => {
      const createBookDto: CreateBook = {
        title: 'New Book',
        author: 'New Author',
        genre: 'Fiction',
        pages: 250,
        yearPublished: 2023,
        isbn13: 9781234567890,
        status: 'AVAILABLE' as any,
      };
      mockBookModel.create.mockResolvedValue(mockBook);

      const result = await service.createBook(createBookDto);

      expect(result).toEqual(mockBook);
      expect(model.create).toHaveBeenCalledWith(createBookDto);
    });

    it('should throw InternalServerErrorException on error', async () => {
      const createBookDto: CreateBook = {
        title: 'New Book',
        author: 'New Author',
        genre: 'Fiction',
        pages: 250,
        yearPublished: 2023,
        isbn13: 9781234567890,
        status: 'AVAILABLE' as any,
      };
      const error = new Error('Database error');
      mockBookModel.create.mockRejectedValue(error);

      await expect(service.createBook(createBookDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateBook', () => {
    it('should update a book', async () => {
      const updateBookDto: UpdateBook = { title: 'Updated Book' };
      const updatedBook = { ...mockBook, title: 'Updated Book' };
      mockBookModel.findByIdAndUpdate.mockResolvedValue(updatedBook);

      const result = await service.updateBook(
        '507f1f77bcf86cd799439011',
        updateBookDto,
      );

      expect(result).toEqual(updatedBook);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateBookDto,
      );
    });

    it('should throw InternalServerErrorException on error', async () => {
      const updateBookDto: UpdateBook = { title: 'Updated Book' };
      const error = new Error('Database error');
      mockBookModel.findByIdAndUpdate.mockRejectedValue(error);

      await expect(
        service.updateBook('507f1f77bcf86cd799439011', updateBookDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteBook', () => {
    it('should delete a book', async () => {
      mockBookModel.findByIdAndDelete.mockResolvedValue(mockBook);

      const result = await service.deleteBook('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockBook);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw InternalServerErrorException on error', async () => {
      const error = new Error('Database error');
      mockBookModel.findByIdAndDelete.mockRejectedValue(error);

      await expect(
        service.deleteBook('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
