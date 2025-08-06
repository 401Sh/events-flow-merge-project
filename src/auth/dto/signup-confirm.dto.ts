import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpConfirmDto {
  @ApiProperty({
    description: 'Почта пользователя',
    example: 'user123@mail.example',
  })
  @Type(() => String)
  @IsString()
  @IsEmail({}, { message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Код подтверждения',
  })
  @Type(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;
}