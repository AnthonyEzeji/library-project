import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBook } from './dto/create-book.dto';
import { UpdateBook } from './dto/update-book.dto';
import { QueryBook } from './dto/query-book.dto';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  const mockBooksService = {
    getAllBooks: jest.fn(),
    getBookById: jest.fn(),
    createBook: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn(),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of books', async () => {
      const query: QueryBook = { limit: 10 };
      const expectedBooks = [mockBook];
      mockBooksService.getAllBooks.mockResolvedValue(expectedBooks);

      const result = await controller.getAll(query);

      expect(result).toEqual(expectedBooks);
      expect(service.getAllBooks).toHaveBeenCalledWith(query);
    });
  });

  describe('getById', () => {
    it('should return a book by id', async () => {
      mockBooksService.getBookById.mockResolvedValue(mockBook);

      const result = await controller.getById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockBook);
      expect(service.getBookById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw BadRequestException for invalid id', () => {
      expect(() => controller.getById('invalid-id')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const createBookDto: CreateBook = {
        title: 'New Book',
        author: 'New Author',
        genre: 'Fiction',
        pages: 250,
        yearPublished: 2023,
        isbn13: 9781234567890,
        status: 'AVAILABLE' as any,
      };
      mockBooksService.createBook.mockResolvedValue(mockBook);

      const result = await controller.create(createBookDto);

      expect(result).toEqual(mockBook);
      expect(service.createBook).toHaveBeenCalledWith(createBookDto);
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const updateBookDto: UpdateBook = { title: 'Updated Book' };
      const updatedBook = { ...mockBook, title: 'Updated Book' };
      mockBooksService.updateBook.mockResolvedValue(updatedBook);

      const result = await controller.update(
        '507f1f77bcf86cd799439011',
        updateBookDto,
      );

      expect(result).toEqual(updatedBook);
      expect(service.updateBook).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateBookDto,
      );
    });

    it('should throw BadRequestException for invalid id', () => {
      const updateBookDto: UpdateBook = { title: 'Updated Book' };
      expect(() => controller.update('invalid-id', updateBookDto)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a book', async () => {
      mockBooksService.deleteBook.mockResolvedValue(mockBook);

      const result = await controller.delete('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockBook);
      expect(service.deleteBook).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw BadRequestException for invalid id', () => {
      expect(() => controller.delete('invalid-id')).toThrow(
        BadRequestException,
      );
    });
  });
});
