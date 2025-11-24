import {
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateHotelRoomDto {
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Описание должно быть не менее 10 символов' })
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
