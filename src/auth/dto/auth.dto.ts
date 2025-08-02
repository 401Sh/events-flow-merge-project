import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    description: 'Логин пользователя',
    example: 'user123',
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
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;
}