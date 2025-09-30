import { IsDate, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateCheckoutDto {
  @IsNotEmpty()
  @IsDate()
  borrowedAt: Date;
  @IsDate()
  returnedAt?: Date;
  @IsNotEmpty()
  @IsMongoId()
  user: string;
  @IsNotEmpty()
  @IsMongoId()
  book: string;
}
