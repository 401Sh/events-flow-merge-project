import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { EventLocation } from '../interfaces/event-location.interface';

export class EventLocationDto implements EventLocation {
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

  @ApiPropertyOptional({
    description: 'Адрес проведения мероприятия',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  address: string | null;
}
