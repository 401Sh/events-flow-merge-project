import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { LIMIT_CITY_MIN_VALUE } from 'src/common/constants/dto-request-limits.constant';

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
  @Min(LIMIT_CITY_MIN_VALUE, {
    message: `Limit cannot be less than ${LIMIT_CITY_MIN_VALUE}`,
  })
  limit: number = LIMIT_CITY_MIN_VALUE;
}
