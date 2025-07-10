import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { EventThemesDto } from './event-themes.dto';
import { Type } from 'class-transformer';

export class EventThemesList {
  @ApiProperty({ type: [EventThemesDto] })
  @ValidateNested({ each: true })
  @Type(() => EventThemesDto)
  data: EventThemesDto[];
}
