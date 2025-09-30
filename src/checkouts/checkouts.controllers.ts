import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { isValidObjectId } from 'mongoose';
import { CheckoutService } from './checkouts.service';
import { QueryCheckoutDto } from './dto/query-checkout.dto';
import { AdminGuard } from 'src/guards/admin-guard';
@UseGuards(AdminGuard)
@Controller('checkouts')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}
  @Get()
  async getCheckouts(@Query() queryCheckoutDto: QueryCheckoutDto) {
    return this.checkoutService.getCheckouts(queryCheckoutDto);
  }
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
