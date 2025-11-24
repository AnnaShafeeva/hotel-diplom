import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  @MinLength(5, { message: 'Название должно быть не менее 5 символов' })
  @IsNotEmpty()
  title: string;

  @IsString()
  @MinLength(100, { message: 'Описание должно быть не менее 100 символов' })
  @IsNotEmpty()
  description: string;
}
