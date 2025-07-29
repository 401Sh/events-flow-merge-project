import { ApiProperty } from '@nestjs/swagger';
import { UserLocation } from '../interfaces/user-location.interface';
import { UserProfile } from '../interfaces/user-profile.interface';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserLocationDto } from './user-location.dto';
import { EventAPISource } from 'src/events/enums/event-source.enum';

export class UserProfileDto implements UserProfile {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: string;

  @ApiProperty({ type: String })
  @IsString()
  firstName: string;

  @ApiProperty({ type: String })
  @IsString()
  lastName: string;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  fatherName: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  email: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  gender: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  birthday: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  phone: string | null;

  @ApiProperty({ type: UserLocationDto })
  @ValidateNested()
  @Type(() => UserLocationDto)
  address: UserLocation;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  url: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  photoUrl: string | null;

  @ApiProperty({ enum: EventAPISource })
  @IsEnum(EventAPISource)
  source: EventAPISource;
}