import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { isValidObjectId } from 'mongoose';
import { CheckoutService } from './checkouts.service';

@Controller('checkouts')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}
  @Get(':bookId')
  async getCheckoutByBookId(@Param('bookId') bookId: string) {
    const isValid = isValidObjectId(bookId);
    if (!isValid) {
      throw new BadRequestException('Invalid book ID.');
    }
    return this.checkoutService.getCheckoutByBookId(bookId);
  }
  @Post()
  async createCheckout(@Body() createCheckoutDto: CreateCheckoutDto) {
    return this.checkoutService.create(createCheckoutDto);
  }
  @Patch(':id')
  async update(@Param('id') id: string) {
    return await this.checkoutService.returnBook(id);
  }
}
