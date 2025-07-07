import { IsInt, IsOptional, Min } from 'class-validator';

export class GetEventListQueryDto {
  @IsInt()
  @IsOptional()
  @Min(4, { message: 'Limit cannot be less than 4' })
  limit?: number;

  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page cannot be less than 1' })
  page?: number;
}
