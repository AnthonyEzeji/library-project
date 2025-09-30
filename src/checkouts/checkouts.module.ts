import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from 'src/schemas/books.schema';
import { Checkout, CheckoutSchema } from 'src/schemas/checkouts.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { CheckoutService } from './checkouts.service';
import { CheckoutController } from './checkouts.controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Checkout.name,
        schema: CheckoutSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Book.name,
        schema: BookSchema,
      },
    ]),
  ],
  providers: [CheckoutService],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
