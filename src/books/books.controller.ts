import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBook } from './dto/create-book.dto';
import { UpdateBook } from './dto/update-book.dto';
import { QueryBook } from './dto/query-book.dto';
import { isValidObjectId } from 'mongoose';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}
  @Get()
  getAll(@Query() query: QueryBook) {
    return this.booksService.getAllBooks(query);
  }
  @Get(':id')
  getById(@Param('id') id: string) {
    const isValid = isValidObjectId(id);
    if (!isValid) {
      throw new BadRequestException('Invalid ID');
    }
    return this.booksService.getBookById(id);
  }
  @Post()
  create(@Body() book: CreateBook) {
    return this.booksService.createBook(book);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() update: UpdateBook) {
    const isValid = isValidObjectId(id);
    if (!isValid) {
      throw new BadRequestException('Invalid ID');
    }
    return this.booksService.updateBook(id, update);
  }
  @Delete(':id')
  delete(@Param('id') id: string) {
    const isValid = isValidObjectId(id);
    if (!isValid) {
      throw new BadRequestException('Invalid ID');
    }
    return this.booksService.deleteBook(id);
  }
}
