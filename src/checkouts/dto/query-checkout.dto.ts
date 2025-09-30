import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { CreateCheckoutDto } from './create-checkout.dto';
import { Transform } from 'class-transformer';


export class QueryCheckoutDto extends PartialType(CreateCheckoutDto) {
  @IsOptional()
  @Transform(({ value }) => new Date(value as string))
  @IsNotEmpty()
  @IsDate()
  borrowedAt: Date;
  @IsOptional()
  @Transform(({ value }) => new Date(value as string))
  @IsDate()
  returnedAt?: Date;
  @IsOptional()
  @IsNotEmpty()
  @IsMongoId()
  user: string;
  @IsOptional()
  @IsNotEmpty()
  @IsMongoId()
  book: string;
}
