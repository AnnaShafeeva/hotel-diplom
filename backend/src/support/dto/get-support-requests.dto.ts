import { IsOptional, IsString } from 'class-validator';

export class GetSupportRequestsDto {
  @IsOptional()
  @IsString()
  isActive?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  offset?: string;
}
