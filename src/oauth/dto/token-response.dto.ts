import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class TokenResponseDto {
  @ApiProperty({
    description: 'Id пользователя',
    type: Number,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Access токен доступа пользователя',
    type: String,
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    description: 'Refresh токен для обновления токена доступа',
    type: String,
  })
  @IsString()
  refreshToken: string;

  @ApiProperty({
    description: 'Источник токена доступа (leaderId или timepad)',
    type: String,
  })
  @IsString()
  source: string;
}