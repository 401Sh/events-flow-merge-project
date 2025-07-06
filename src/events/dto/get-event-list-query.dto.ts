import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { SortableFields } from "../enums/query-event.enum";

export class GetEventListQueryDto {
  @IsInt()
  @IsOptional()
  @Min(4, { message: 'Limit cannot be less than 4' })
  limit?: number;

  @IsInt()
  @IsOptional()
  @Min(1, { message: 'Page cannot be less than 1' })
  page?: number;

  @IsEnum(SortableFields, {
    message: `sortField must be one of: ${Object.values(SortableFields).join(', ')}`,
  })
  @IsOptional()
  sortField: string;

  @IsEnum(['asc', 'desc'], {
    message: 'sortOrder must be either "asc" or "desc"',
  })
  @IsOptional()
  sortOrder: string;
}