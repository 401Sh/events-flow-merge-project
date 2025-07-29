import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CityDto } from './city.dto';

export class CititesListResultDto {
  @ApiProperty({
    description: 'Список городов',
    isArray: true,
    type: () => CityDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CityDto)
  data: CityDto[];
}
