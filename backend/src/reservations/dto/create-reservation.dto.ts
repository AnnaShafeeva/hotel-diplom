import { IsDateString, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @IsMongoId()
  @IsNotEmpty()
  hotelRoom: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
