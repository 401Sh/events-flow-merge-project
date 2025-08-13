import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RefreshBodyDto {
  @ApiProperty({
    description: 'Refresh токен для обновления доступа',
    type: String,
  })
  @IsString()
  refreshToken: string;
}