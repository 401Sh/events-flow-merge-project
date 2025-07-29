import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetCitiesQueryDto {
  @ApiPropertyOptional({
    description: 'Количество городов на странице',
    example: 6,
    minimum: 4,
    type: Number,
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
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page cannot be less than 1' })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Строка для поиска по названию города',
    type: String,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
