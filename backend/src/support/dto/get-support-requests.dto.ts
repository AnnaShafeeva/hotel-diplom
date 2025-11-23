import { IsOptional, IsBooleanString, IsNumberString } from 'class-validator';

export class GetSupportRequestsDto {
  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  offset?: string;
}
