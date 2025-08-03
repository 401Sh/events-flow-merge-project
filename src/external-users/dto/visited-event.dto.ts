import { VisitedEvent } from '../interfaces/visited-event.interface';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventAPISource } from 'src/external-events/enums/event-source.enum';

export class VisitedEventDto implements VisitedEvent {
  @ApiProperty({
    description: 'UUID записи посещенного/предстоящего мероприятия',
    type: String,
  })
  @IsString()
  uuid: string;

  @ApiProperty({
    description: 'Id мероприятия',
    type: Number,
  })
  @IsNumber()
  eventId: number;

  @ApiProperty({
    description: 'Было ли мероприятие посещено (true) или его только ' +
      'предстоит посетить (false)',
    type: Boolean,
  })
  @IsBoolean()
  isCompleted: boolean;

  @ApiPropertyOptional({
    description: 'Дата посещения мероприятие',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  completedAt: string | null;

  @ApiProperty({
    description: 'Дата записи на мероприятие',
    type: String,
  })
  @IsString()
  signedUpAt: string;

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
    description: 'Дата окончания регистрации на мероприятие',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  registrationEnd: string | null;

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
    description: 'Источник мероприятия (leaderId или timepad)',
    enum: EventAPISource,
  })
  @IsEnum(EventAPISource)
  source: EventAPISource;
}