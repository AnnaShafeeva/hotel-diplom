import {
  IsBoolean,
  IsDateString,
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
  @IsOptional()
  hotel?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isEnabled?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
