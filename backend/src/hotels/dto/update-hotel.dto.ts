import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateHotelDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Название должно быть не менее 5 символов' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(100, { message: 'Описание должно быть не менее 100 символов' })
  description?: string;
}
