import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

import { Model } from 'mongoose';
import { Book } from 'src/schemas/books.schema';
import { Checkout } from 'src/schemas/checkouts.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Checkout.name) private readonly checkoutModel: Model<Checkout>,
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
  ) {}

  async returnBook(checkoutId: string) {
    try {
      const checkout = await this.checkoutModel.findById(checkoutId);

      if (!checkout) {
        throw new NotFoundException('Checkout not found');
      }

      if (checkout.returnedAt) {
        throw new BadRequestException('Book has already been returned');
      }

      await this.bookModel.findByIdAndUpdate(checkout.book, {
        status: 'AVAILABLE',
      });

      checkout.returnedAt = new Date();
      await checkout.save();

      return checkout;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'An error occurred',
      );
    }
  }

  async create(createCheckoutDto: CreateCheckoutDto) {
    try {
      const { book } = createCheckoutDto;
      const bookDoc = await this.bookModel.findById(book);
      if (!bookDoc || bookDoc.status !== 'AVAILABLE') {
        throw new BadRequestException('Book is not available.');
      }

      await this.bookModel.findByIdAndUpdate(bookDoc._id, {
        status: 'UNAVAILABLE',
      });

      return await this.checkoutModel.create({
        ...createCheckoutDto,
        book: bookDoc._id,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'An error occurred',
      );
    }
  }

  async getCheckoutByBookId(bookId: string) {
    try {
      const checkout = await this.checkoutModel
        .findOne({ book: bookId })
        .sort({ borrowedAt: -1 })
        .populate('book');

      if (!checkout) {
        throw new NotFoundException('Checkout not found');
      }

      return checkout;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'An error occurred',
      );
    }
  }
}
