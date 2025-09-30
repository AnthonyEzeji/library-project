import { Module } from '@nestjs/common';
import { BooksModule } from './books/books.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import dotenv from 'dotenv';
import { CheckoutModule } from './checkouts/checkouts.module';
dotenv.config();
const DB = process.env.DB_CONNECTION_STRING;

@Module({
  imports: [
    BooksModule,
    UserModule,
    CheckoutModule,
    MongooseModule.forRoot(DB || ''),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
