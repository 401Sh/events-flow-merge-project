import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ValidateNested } from "class-validator";
import { VisitedEventDto } from "./visited-event.dto";
import { Type } from "class-transformer";
import { EventsListMetaDto } from "src/events/dto/events-list-result.dto";

export class VisitedEventsListResultDto {
  @ApiProperty({ isArray: true, type: () => VisitedEventDto })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisitedEventDto)
  data: VisitedEventDto[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => EventsListMetaDto)
  meta: EventsListMetaDto;
}