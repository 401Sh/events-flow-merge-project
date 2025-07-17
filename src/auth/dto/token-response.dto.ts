import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenResponseDto {
  @ApiProperty({ type: String })
  @IsString()
  accessToken: string;

  @ApiProperty({ type: String })
  @IsString()
  source: string;
}
