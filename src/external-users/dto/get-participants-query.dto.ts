import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import {
  LIMIT_EVENT_MIN_VALUE,
  PAGE_START_VALUE
} from 'src/common/constants/dto-request-limits.constant';

export class GetParticipantsQueryDto {
  @ApiPropertyOptional({
    description: 'Количество мероприятий на странице',
    example: 10,
    minimum: LIMIT_EVENT_MIN_VALUE,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(LIMIT_EVENT_MIN_VALUE, {
    message: `Limit cannot be less than ${LIMIT_EVENT_MIN_VALUE}`,
  })
  limit: number = LIMIT_EVENT_MIN_VALUE;

  @ApiPropertyOptional({
    description: `Номер страницы (начинается с ${PAGE_START_VALUE})`,
    example: 1,
    minimum: PAGE_START_VALUE,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(PAGE_START_VALUE, {
    message: `Page cannot be less than ${PAGE_START_VALUE}`,
  })
  page: number = PAGE_START_VALUE;
}