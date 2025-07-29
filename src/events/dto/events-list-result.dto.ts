import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UnifiedEventDto } from './unified-event.dto';

export class EventsListMetaDto {
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
    type: () => UnifiedEventDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnifiedEventDto)
  data: UnifiedEventDto[];

  @ApiProperty({
    description: 'Метаданные пагинации',
    type: () => EventsListMetaDto,
  })
  @ValidateNested()
  @Type(() => EventsListMetaDto)
  meta: EventsListMetaDto;
}