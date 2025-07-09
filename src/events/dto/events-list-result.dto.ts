import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UnifiedEventDto } from './unified-event.dto';

export class EventsListMetaDto {
  @ApiProperty()
  @IsNumber()
  totalEventsAmount: number;

  @ApiProperty()
  @IsNumber()
  totalPagesAmount: number;

  @ApiProperty()
  @IsNumber()
  currentPage: number;
}

export class EventsListResultDto {
  @ApiProperty({ isArray: true, type: () => UnifiedEventDto })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnifiedEventDto)
  data: UnifiedEventDto[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => EventsListMetaDto)
  meta: EventsListMetaDto;
}
