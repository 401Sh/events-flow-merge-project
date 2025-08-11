import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EventDto } from './event.dto';

export class EventListMetaDto {
  @ApiProperty({
    description: 'Общее количество мероприятий',
    type: Number,
  })
  @IsNumber()
  totalEventsAmount: number;

  @ApiProperty({
    description: 'Общее количество страниц',
    type: Number,
  })
  @IsNumber()
  totalPagesAmount: number;

  @ApiProperty({
    description: 'Текущая запрошенная страница',
    type: Number,
  })
  @IsNumber()
  currentPage: number;
}

export class EventsListResultDto {
  @ApiProperty({
    description: 'Список мероприятий',
    isArray: true,
    type: () => EventDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventDto)
  data: EventDto[];

  @ApiProperty({
    description: 'Метаданные пагинации',
    type: () => EventListMetaDto,
  })
  @ValidateNested()
  @Type(() => EventListMetaDto)
  meta: EventListMetaDto;
}