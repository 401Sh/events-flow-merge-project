import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EventAPISource } from '../enums/event-source.enum';
import { EventLocationDto } from './event-location.dto';
import { EventThemesDto } from 'src/dictionaries/dto/event-themes.dto';
import { UnifiedEvent } from '../interfaces/unified-event.interface';

export class UnifiedEventDto implements UnifiedEvent {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  shortDescription: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  fullDescription: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  startsAt: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  endsAt: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  registrationStart: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  registrationEnd: string | null;

  @ApiProperty({ type: EventLocationDto })
  @ValidateNested()
  @Type(() => EventLocationDto)
  location: EventLocationDto;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  url: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  posterUrl: string | null;

  @ApiProperty({ type: [EventThemesDto] })
  @ValidateNested({ each: true })
  @Type(() => EventThemesDto)
  tags: EventThemesDto[];

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  organizer: string | null;

  @ApiProperty({ enum: EventAPISource })
  @IsEnum(EventAPISource)
  source: EventAPISource;
}
