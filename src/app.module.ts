import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BooksModule } from './books/books.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import dotenv from 'dotenv';
import { CheckoutModule } from './checkouts/checkouts.module';
import { JwtModule } from '@nestjs/jwt';
import { ValidateTokenMiddleware } from './middleware/auth.middleware';
import { CheckoutController } from './checkouts/checkouts.controllers';
import { BooksController } from './books/books.controller';
import { AuthModule } from './auth/auth.module';
import { UserController } from './users/users.controller';
import { BooksService } from './books/books.service';
import { SharedJwtModule } from './jwt/jwt.module';

dotenv.config();
const DB = process.env.DB_CONNECTION_STRING;

@Module({
  imports: [
    BooksModule,
    UserModule,
    CheckoutModule,
    MongooseModule.forRoot(DB || ''),
    AuthModule,
    SharedJwtModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidateTokenMiddleware)
      .forRoutes(BooksController, CheckoutController, UserController);
  }
}
