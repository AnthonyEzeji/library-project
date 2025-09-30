import { PartialType } from '@nestjs/mapped-types';
import { CreateBook } from './create-book.dto';

export class UpdateBook extends PartialType(CreateBook) {}
