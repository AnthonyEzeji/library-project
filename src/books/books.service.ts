import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBook } from './dto/create-book.dto';
import { UpdateBook } from './dto/update-book.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from 'src/schemas/books.schema';
import { Model, FilterQuery } from 'mongoose';
import { QueryBook } from './dto/query-book.dto';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  async deleteBook(id: string) {
    try {
      return await this.bookModel.findByIdAndDelete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'An error occurred',
      );
    }
  }
  async updateBook(id: string, update: UpdateBook) {
    try {
      return await this.bookModel.findByIdAndUpdate(id, update, { new: true });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'An error occurred',
      );
    }
  }
  async createBook(book: CreateBook) {
    try {
      return await this.bookModel.create(book);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'An error occurred',
      );
    }
  }
  async getBookById(id: string) {
    try {
      return await this.bookModel.findById(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'An error occurred',
      );
    }
  }
  async getAllBooks(query: QueryBook) {
    try {
      const filter: FilterQuery<Book> = {};
      if (query.author) {
        filter.author = query.author;
      }
      if (query.title) {
        filter.title = query.title;
      }
      if (query.pages) {
        filter.pages = { $lte: query.pages };
      }

      return await this.bookModel
        .find(filter)
        .skip(query.limit ? query.limit : 0);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'An error occurred',
      );
    }
  }
}
