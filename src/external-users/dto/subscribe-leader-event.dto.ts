import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class SubscribeLeaderEventDto {
  @ApiProperty({
    description:
      'Отключение уведомлений о мероприятии ' +
      '(без дополнительных прав доступен только false)',
    example: false,
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  disableNotifications: boolean;

  @ApiProperty({
    description: 'Id мероприятия на которое нужно произвести запись',
    example: 563429,
    type: Number,
  })
  @IsNumber()
  eventId: number;

  @IsNumber()
  @IsOptional()
  numberParticipantst: number = 1;
}