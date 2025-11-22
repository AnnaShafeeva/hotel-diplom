import { IsDateString, IsMongoId, IsOptional } from 'class-validator';

export class ReservationSearchParams {
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @IsDateString()
  @IsOptional()
  dateStart?: string;

  @IsDateString()
  @IsOptional()
  dateEnd?: string;
}
