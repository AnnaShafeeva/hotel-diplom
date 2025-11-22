import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchRoomsParams {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  limit: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset: number;

  @IsString()
  @IsNotEmpty()
  hotel: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isEnabled?: boolean;
}
