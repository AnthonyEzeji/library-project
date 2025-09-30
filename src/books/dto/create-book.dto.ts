import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

enum Status {
  available = 'AVAILABLE',
  unavailable = 'UNAVAILABLE',
}
export class CreateBook {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsNotEmpty()
  author: string;
  @IsString()
  genre: string;
  @IsNumber()
  pages: number;
  @IsNumber()
  @IsNotEmpty()
  yearPublished: number;
  @IsOptional()
  @IsString()
  imgUri?: string;
  @IsNumber()
  @IsNotEmpty()
  isbn13: number;
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;
}
