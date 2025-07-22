import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UserLocation } from '../interfaces/user-location.interface';

export class UserLocationDto implements UserLocation {
  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  house: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  building: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  street: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  country: string | null;

  @ApiProperty({ nullable: true, type: String, required: false })
  @IsOptional()
  @IsString()
  city: string | null;
}