import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class SubscribeParticipationResultDto {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  disableNotifications: boolean;

  @ApiProperty({ type: Number })
  @IsNumber()
  eventId: number;

  @ApiProperty({ type: String })
  @IsString()
  quizAnswerId: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  numberParticipantst: number;
}