import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SearchUserParamsDto {
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
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;
}
