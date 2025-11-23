import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateSupportRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10, {
    message: 'Текст обращения должен быть не менее 10 символов',
  })
  text: string;
}
