import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class SubscribeLeaderEventDto {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  disableNotifications: boolean;

  @ApiProperty({ type: Number })
  @IsNumber()
  eventId: number;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  quizAnswerId?: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  numberParticipantst: number = 1;
}