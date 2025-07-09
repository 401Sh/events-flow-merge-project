import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { EventLocation } from "../interfaces/event-location.interface";

export class EventLocationDto implements EventLocation {
  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  country: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  city: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  address: string | null;
}