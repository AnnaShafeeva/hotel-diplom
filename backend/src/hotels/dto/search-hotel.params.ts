import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchHotelParams {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  limit: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset: number;

  @IsOptional()
  @IsString()
  title?: string;
}
