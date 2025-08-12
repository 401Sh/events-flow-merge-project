import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  LIMIT_CITY_MIN_VALUE,
  PAGE_START_VALUE,
} from 'src/common/constants/dto-request-limits.constant';

export class GetCitiesQueryDto {
  @ApiPropertyOptional({
    description: 'Количество городов на странице',
    example: 6,
    minimum: LIMIT_CITY_MIN_VALUE,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(LIMIT_CITY_MIN_VALUE, {
    message: `Limit cannot be less than ${LIMIT_CITY_MIN_VALUE}`,
  })
  limit: number = LIMIT_CITY_MIN_VALUE;

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

  @ApiPropertyOptional({
    description: 'Строка для поиска по названию города',
    type: String,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
