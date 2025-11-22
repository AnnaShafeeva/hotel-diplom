import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateHotelRoomDto {
  @IsString()
  @IsNotEmpty({ message: 'Описание обязательно' })
  description: string;

  @IsMongoId({ message: 'Некорректный ID отеля' })
  @IsNotEmpty()
  hotelId: string;

  @IsOptional()
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
