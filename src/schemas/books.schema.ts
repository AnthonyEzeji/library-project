import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Book {
  @Prop({ unique: true, required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop()
  genre?: string;

  @Prop({ unique: true })
  isbn13: number;

  @Prop({ required: true })
  yearPublished: number;

  @Prop({ unique: true })
  imgUri?: string;

  @Prop()
  pages: number;
  @Prop()
  status: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
