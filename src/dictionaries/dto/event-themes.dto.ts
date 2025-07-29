import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class EventThemesDto {
  @ApiProperty({
    description: 'Id темы мероприятия',
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Название темы мероприятия',
    type: String,
  })
  @IsString()
  name: string;
}