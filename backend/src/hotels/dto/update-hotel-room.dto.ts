import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateHotelRoomDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId({ message: 'Некорректный ID отеля' })
  hotelId?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  images?: string[];
}
