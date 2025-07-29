import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CityDto {
  @ApiProperty({
    description: 'Id города',
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Название города',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Интернациональное название города',
    type: String,
  })
  @IsString()
  intName: string;
}
