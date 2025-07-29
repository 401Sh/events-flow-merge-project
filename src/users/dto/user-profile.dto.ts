import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Id пользователя',
    required: true,
    nullable: false,
    type: Number,
  })
  @IsNumber()
  id: string;

  @ApiProperty({
    description: 'Имя пользователя',
    type: String,
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    type: String,
  })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Отчество пользователя',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  fatherName: string | null;

  @ApiPropertyOptional({
    description: 'Адрес почты пользователя',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  email: string | null;

  @ApiPropertyOptional({
    description: 'Пол пользователя',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  gender: string | null;

  @ApiPropertyOptional({
    description: 'Дата рождения пользователя',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  birthday: string | null;

  @ApiPropertyOptional({
    description: 'Описание пользователя',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiPropertyOptional({
    description: 'Номер телефона пользователя',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  phone: string | null;

  @ApiProperty({
    description: 'Адрес проживания/работы пользователя',
    type: () => UserLocationDto,
  })
  @ValidateNested()
  @Type(() => UserLocationDto)
  address: UserLocation;

  @ApiPropertyOptional({
    description: 'Ссылка на страницу пользователя в источнике',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  url: string | null;

  @ApiPropertyOptional({
    description: 'Ссылка на изображение профиля',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  photoUrl: string | null;

  @ApiProperty({
    description: 'Источник профиля пользователя (leaderId или timepad)',
    enum: EventAPISource,
  })
  @IsEnum(EventAPISource)
  source: EventAPISource;
}