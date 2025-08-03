import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { TimepadDataDto } from './timepad-data.dto';
import { LeaderDataDto } from './leader-data.dto';

export class TimepadEventResultDto {
  @ApiProperty({
    description: 'Данные мероприятия от timepad',
    type: TimepadDataDto,
  })
  @ValidateNested()
  @Type(() => TimepadDataDto)
  data: TimepadDataDto;
}

export class LeaderEventResultDto {
  @ApiProperty({
    description: 'Данные мероприятия от leaderId',
    type: LeaderDataDto,
  })
  @ValidateNested()
  @Type(() => LeaderDataDto)
  data: LeaderDataDto;
}