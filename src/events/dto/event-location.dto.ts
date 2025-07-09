import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { EventLocation } from "../interfaces/event-location.interface";

export class EventLocationDto implements EventLocation {
  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  country: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  city: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  address: string | null;
}