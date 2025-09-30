import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryBook {
  @Transform(({ value }) => parseInt(value as string))
  @IsOptional()
  @IsNumber()
  pages?: number;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @Transform(({ value }) => parseInt(value as string))
  @IsOptional()
  @IsNumber()
  limit?: number;
}
