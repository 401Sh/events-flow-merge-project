import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UserLocation } from '../interfaces/user-location.interface';

export class UserLocationDto implements UserLocation {
  @ApiPropertyOptional({
    description: 'Номер квартиры',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  house: string | null;

  @ApiPropertyOptional({
    description: 'Номер здания',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  building: string | null;

  @ApiPropertyOptional({
    description: 'Название улицы',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  street: string | null;

  @ApiPropertyOptional({
    description: 'Название страны',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  country: string | null;

  @ApiPropertyOptional({
    description: 'Название города',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  city: string | null;
}