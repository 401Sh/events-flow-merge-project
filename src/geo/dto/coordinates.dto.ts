import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

// TODO: Add type field and check on 'Point' value?
export class CoordinatesDto {
  @ApiProperty({
    description: 'Широта',
    example: 55.0288307,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Долгота',
    example: 82.9226887,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  longitude: number;
}
