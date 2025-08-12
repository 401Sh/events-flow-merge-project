import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import {
  LIMIT_EVENT_MIN_VALUE,
  PAGE_START_VALUE,
} from 'src/common/constants/dto-request-limits.constant';

export class GetEventListQueryDto {
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

  @ApiPropertyOptional({
    description: 'Поисковая строка для фильтрации мероприятий по названию',
    example: 'ФОТО экскурсия',
    type: String,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Список Id тем мероприятий',
    example: [1, 2, 3],
    isArray: true,
    type: Number,
  })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(Number);
    }
    if (typeof value === 'string') {
      return [Number(value)];
    }
    return value;
  })
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  themes?: number[];

  @ApiPropertyOptional({
    description: 'Id города',
    example: 1,
    minimum: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Id cannot be less than 1' })
  cityId?: number;

  @ApiPropertyOptional({
    description: 'Начало диапазона даты',
    example: '2020-12-30',
    type: String,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM-DD',
  })
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Конец диапазона даты',
    example: '2020-12-31',
    type: String,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM-DD',
  })
  dateTo?: string;
}