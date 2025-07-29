import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { EventThemesDto } from './event-themes.dto';
import { Type } from 'class-transformer';

export class EventThemesList {
  @ApiProperty({
    description: 'Список тем мероприятий',
    isArray: true,
    type: () => EventThemesDto,
  })
  @ValidateNested({ each: true })
  @Type(() => EventThemesDto)
  data: EventThemesDto[];
}