import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

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
  @Type(() => Number)
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  themes?: number[]
}
