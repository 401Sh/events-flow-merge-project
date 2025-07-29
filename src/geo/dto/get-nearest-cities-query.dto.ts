import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetNearestCitiesQueryDto {
  @ApiPropertyOptional({
    description: 'Количество ближайших городов',
    example: 5,
    minimum: 2,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(2, { message: 'Limit cannot be less than 2' })
  limit: number = 5;
}
