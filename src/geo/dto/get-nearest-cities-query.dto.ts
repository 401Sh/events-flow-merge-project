import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetNearestCitiesQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(2, { message: 'Limit cannot be less than 2' })
  limit: number = 5;
}
