import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { UnifiedEventDto } from './unified-event.dto';
import { Type } from 'class-transformer';

export class TimepadSpecificDataDto {
  @ApiProperty({ nullable: true, type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  isSendingFreeTickets: boolean | null;
}

export class TimepadDataDto extends UnifiedEventDto {
  @ApiProperty({ type: TimepadSpecificDataDto })
  @ValidateNested()
  @Type(() => TimepadSpecificDataDto)
  specificData: TimepadSpecificDataDto;
}
