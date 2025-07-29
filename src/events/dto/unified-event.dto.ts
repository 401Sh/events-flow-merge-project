import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventAPISource } from '../enums/event-source.enum';
import { EventLocationDto } from './event-location.dto';
import { EventThemesDto } from 'src/dictionaries/dto/event-themes.dto';
import { UnifiedEvent } from '../interfaces/unified-event.interface';

export class UnifiedEventDto implements UnifiedEvent {
  @ApiProperty({
    description: 'Id мероприятия',
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Заголовок мероприятия',
    type: String,
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Описание мероприятия',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiPropertyOptional({
    description: 'Дата начала мероприятия',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  startsAt: string | null;

  @ApiPropertyOptional({
    description: 'Дата окончания мероприятия',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  endsAt: string | null;

  @ApiPropertyOptional({
    description: 'Дата начала регистрации на мероприятие',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  registrationStart: string | null;

  @ApiPropertyOptional({
    description: 'Дата окончания мероприятия',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  registrationEnd: string | null;

  @ApiProperty({
    description: 'Место проведения мероприятия',
    type: () => EventLocationDto,
  })
  @ValidateNested()
  @Type(() => EventLocationDto)
  location: EventLocationDto;

  @ApiPropertyOptional({
    description: 'Ссылка на мероприятие в его источнике',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  url: string | null;

  @ApiPropertyOptional({
    description: 'Ссылка на постер мероприятия',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  posterUrl: string | null;

  @ApiProperty({
    description: 'Список связанных с мероприятием категорий',
    isArray: true,
    type: () => EventThemesDto,
  })
  @ValidateNested({ each: true })
  @Type(() => EventThemesDto)
  themes: EventThemesDto[];

  @ApiPropertyOptional({
    description: 'Организатор мероприятия',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  organizer: string | null;

  @ApiProperty({
    description: 'Источник мероприятия (leaderId или timepad)',
    enum: EventAPISource,
  })
  @IsEnum(EventAPISource)
  source: EventAPISource;
}