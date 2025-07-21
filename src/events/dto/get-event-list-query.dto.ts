import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class GetEventListQueryDto {
  @ApiPropertyOptional({
    description: 'Количество мероприятий на странице',
    example: 10,
    minimum: 4,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(4, { message: 'Limit cannot be less than 4' })
  limit: number = 4;

  @ApiPropertyOptional({
    description: 'Номер страницы (начинается с 1)',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page cannot be less than 1' })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Поисковая строка для фильтрации мероприятий по названию',
    example: 'ФОТО экскурсия',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Id тем мероприятий',
    example: [1, 2, 3],
  })
  @Transform(({ value }) =>  {
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
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Id cannot be less than 1' })
  cityId?: number;

  @ApiPropertyOptional({
    description: 'Начало диапазона даты',
    example: "2020-12-30",
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM-DD',
  })
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Конец диапазона даты',
    example: "2020-12-31",
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM-DD',
  })
  dateTo?: string;
}
