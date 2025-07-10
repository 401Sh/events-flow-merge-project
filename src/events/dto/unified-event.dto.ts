import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsString()
  title: string;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  shortDescription: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  fullDescription: string | null;

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

  @ApiProperty({ type: EventLocationDto })
  @ValidateNested()
  @Type(() => EventLocationDto)
  location: EventLocationDto;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  url: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  posterUrl: string | null;

  @ApiProperty({ type: [EventThemesDto] })
  @ValidateNested({ each: true })
  @Type(() => EventThemesDto)
  themes: EventThemesDto[];

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  organizer: string | null;

  @ApiProperty({ enum: EventAPISource })
  @IsEnum(EventAPISource)
  source: EventAPISource;
}
