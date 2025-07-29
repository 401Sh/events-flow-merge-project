import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CityDto } from './city.dto';

export class CitiesListMetaDto {
  @ApiProperty({
    description: 'Общее количество городов',
    type: Number,
  })
  @IsNumber()
  totalCitiesAmount: number;

  @ApiProperty({
    description: 'Общее количество страниц',
    type: Number,
  })
  @IsNumber()
  totalPagesAmount: number;

  @ApiProperty({
    description: 'Текущая запрошенная страница',
    type: Number,
  })
  @IsNumber()
  currentPage: number;
}

export class CititesListResultWithMetaDto {
  @ApiProperty({
    description: 'Список городов',
    isArray: true,
    type: () => CityDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CityDto)
  data: CityDto[];

  @ApiProperty({
    description: 'Метаданные пагинации',
    type: () => CitiesListMetaDto,
  })
  @ValidateNested()
  @Type(() => CitiesListMetaDto)
  meta: CitiesListMetaDto;
}
