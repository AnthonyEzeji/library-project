import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Book } from './books.schema';
import { User } from './users.schema';

@Schema()
export class Checkout {
  @Prop({ required: true })
  borrowedAt: Date;
  @Prop()
  returnedAt?: Date;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId | Book;
}

export const CheckoutSchema = SchemaFactory.createForClass(Checkout);
