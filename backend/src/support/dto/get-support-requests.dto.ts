import { Type } from 'class-transformer';
import { IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class GetSupportRequestsDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
