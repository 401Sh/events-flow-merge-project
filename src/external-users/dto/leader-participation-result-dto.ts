import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber } from "class-validator";

export class LeaderParticipationResult {
  @ApiProperty({
    description: 'Флаг записи пользователя на мероприятие.' +
      'true - пользователь записан, false - у пользователя нет записи',
    type: Boolean,
  })
  @IsBoolean()
  isParticipated: boolean;

  @ApiProperty({
    description: 'Id мероприятия',
    type: Number,
  })
  @IsNumber()
  eventId: number;
}