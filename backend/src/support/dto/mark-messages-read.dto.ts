import { IsDateString, IsNotEmpty } from 'class-validator';

export class MarkMessagesReadDto {
  @IsDateString()
  @IsNotEmpty()
  createdBefore: string;
}
