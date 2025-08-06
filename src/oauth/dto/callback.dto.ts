import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CallbackDto {
  @ApiProperty({
    description: 'Код для обмена на access токен',
    type: String,
  })
  @IsString()
  @IsOptional()
  code: string;

  @IsString()
  @IsOptional()
  error_description: string;

  @IsString()
  @IsOptional()
  error: string;
}