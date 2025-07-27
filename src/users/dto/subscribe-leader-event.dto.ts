import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber } from "class-validator";

export class SubscribeLeaderEventDto {
  @ApiProperty({
    description: 'Отключение уведомлений (без дополнительных прав доступен только false)',
    example: false,
    default: false,
    type: Boolean 
  })
  @IsBoolean()
  disableNotifications: boolean;

  @ApiProperty({
    description: 'Id мероприятия на которое нужно произвести запись',
    example: 563429,
    type: Number 
  })
  @IsNumber()
  eventId: number;

  // @ApiProperty({ nullable: true, type: String, required: false })
  // @IsOptional()
  // @IsString()
  // quizAnswerId?: string;

  @ApiProperty({
    example: 2,
    default: 1,
    type: Number 
  })
  @IsNumber()
  numberParticipantst: number = 1;
}