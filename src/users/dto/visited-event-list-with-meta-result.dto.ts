import { IsArray, ValidateNested } from 'class-validator';
import { VisitedEventDto } from './visited-event.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EventsListMetaDto } from 'src/events/dto/events-list-result.dto';

export class VisitedEventsListWithMetaResultDto {
  @ApiProperty({
    description: 'Список посещенных/предстоящих мероприятий',
    isArray: true,
    type: () => VisitedEventDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisitedEventDto)
  data: VisitedEventDto[];

  @ApiProperty({
    description: 'Метаданные пагинации',
    type: () => EventsListMetaDto,
  })
  @ValidateNested()
  @Type(() => EventsListMetaDto)
  meta: EventsListMetaDto;
}