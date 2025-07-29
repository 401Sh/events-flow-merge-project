import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserProfileDto } from './user-profile.dto';

export class UserProfileResultDto {
  @ApiProperty({
    description: 'Информация о пользователе',
    type: () => UserProfileDto,
  })
  @ValidateNested()
  @Type(() => UserProfileDto)
  data: UserProfileDto;
}