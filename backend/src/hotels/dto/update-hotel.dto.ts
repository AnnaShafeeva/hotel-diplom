import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateHotelDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Название должно быть не менее 5 символов' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Описание должно быть не менее 10 символов' })
  description?: string;
}
