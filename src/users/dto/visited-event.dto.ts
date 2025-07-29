import { VisitedEvent } from '../interfaces/visited-event.interface';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventAPISource } from 'src/events/enums/event-source.enum';

export class VisitedEventDto implements VisitedEvent {
  @ApiProperty({ type: String })
  @IsString()
  uuid: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  eventId: number;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  completed: boolean;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  completedAt: string;

  @ApiProperty({ type: String })
  @IsString()
  signedUpAt: string;

  @ApiProperty({ type: String })
  @IsString()
  title: string;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  startsAt: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  endsAt: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  registrationStart: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  registrationEnd: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  url: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  posterUrl: string | null;

  @ApiProperty({ enum: EventAPISource })
  @IsEnum(EventAPISource)
  source: EventAPISource;
}