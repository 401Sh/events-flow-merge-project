// leader-participant.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { UnifiedEventDto } from './unified-event.dto';

export class LeaderParticipantDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  photo: string;
}

export class LeaderSpecificDataDto {
  @ApiProperty()
  @IsNumber()
  participantsCount: number;

  @ApiProperty({ type: [LeaderParticipantDto] })
  @ValidateNested({ each: true })
  @Type(() => LeaderParticipantDto)
  participants: LeaderParticipantDto[];
}

export class LeaderDataDto extends UnifiedEventDto {
  @ApiProperty({ type: LeaderSpecificDataDto })
  @ValidateNested()
  @Type(() => LeaderSpecificDataDto)
  specificData: LeaderSpecificDataDto;
}
