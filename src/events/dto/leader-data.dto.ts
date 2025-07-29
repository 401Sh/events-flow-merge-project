import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { UnifiedEventDto } from './unified-event.dto';

export class LeaderParticipantDto {
  @ApiProperty({
    description: 'Id участника мероприятия',
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Имя участника мероприятия',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Ссылка на изображение профиля участника мероприятия',
    type: String,
  })
  @IsString()
  photo: string;
}

export class LeaderSpecificDataDto {
  @ApiProperty({
    description: 'Количество участников мероприятия',
    type: Number,
  })
  @IsNumber()
  participantsCount: number;

  @ApiProperty({
    description: 'Список участников мероприятия',
    isArray: true,
    type: () => LeaderParticipantDto,
  })
  @ValidateNested({ each: true })
  @Type(() => LeaderParticipantDto)
  participants: LeaderParticipantDto[];
}

export class LeaderDataDto extends UnifiedEventDto {
  @ApiProperty({
    description: 'Специфические для leaderId данные',
    type: () => LeaderSpecificDataDto,
  })
  @ValidateNested()
  @Type(() => LeaderSpecificDataDto)
  specificData: LeaderSpecificDataDto;
}
