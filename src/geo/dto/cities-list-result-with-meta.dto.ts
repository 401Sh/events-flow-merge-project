import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CityDto } from './city.dto';

export class CitiesListMetaDto {
  @ApiProperty()
  @IsNumber()
  totalCitiesAmount: number;

  @ApiProperty()
  @IsNumber()
  totalPagesAmount: number;

  @ApiProperty()
  @IsNumber()
  currentPage: number;
}

export class CititesListResultWithMetaDto {
  @ApiProperty({ isArray: true, type: () => CityDto })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CityDto)
  data: CityDto[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => CitiesListMetaDto)
  meta: CitiesListMetaDto;
}
