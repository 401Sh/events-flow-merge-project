import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class GetNearestCitiesQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(5, { message: 'Limit cannot be less than 5' })
  limit: number = 5;
}
