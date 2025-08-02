import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CallbackDto {
  @ApiProperty({
    description: 'Код для обмена на access токен',
    type: String,
  })
  @IsString()
  code: string;
}