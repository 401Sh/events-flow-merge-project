import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class TokenResultDto {
  @ApiProperty({
    description: 'Access токен доступа',
    type: String,
  })
  @IsString()
  accessToken: string;
}