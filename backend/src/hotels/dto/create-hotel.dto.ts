import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  @MinLength(5, { message: 'Название должно быть не менее 5 символов' })
  @IsNotEmpty()
  title: string;

  @IsString()
  @MinLength(10, { message: 'Описание должно быть не менее 10 символов' })
  @IsNotEmpty()
  description: string;
}
