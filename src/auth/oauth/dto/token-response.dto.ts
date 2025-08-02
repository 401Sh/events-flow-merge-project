import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenResponseDto {
  @ApiProperty({
    description: 'Id пользователя',
    type: Number,
  })
  @IsString()
  userId: number;

  @ApiProperty({
    description: 'Access токен доступа пользователя',
    type: String,
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    description: 'Источник токена доступа (leaderId или timepad)',
    type: String
  })
  @IsString()
  source: string;
}