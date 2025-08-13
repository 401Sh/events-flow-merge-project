import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH } from 'src/common/constants/dto-request-limits.constant';

export class AuthDto {
  @ApiProperty({
    description: 'Почта пользователя',
    example: 'user123@mail.example',
  })
  @Type(() => String)
  @IsString()
  @IsEmail({}, { message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'securePassword123',
  })
  @Type(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: 'Password must be at least 6 characters long.',
  })
  password: string;
}