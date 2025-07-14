import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CallbackResultDto {
  @IsNumber()
  user_id: number;

  @IsBoolean()
  user_validated: boolean;

  @IsString()
  access_token: string;
  
  @IsString()
  refresh_token: string;
}
