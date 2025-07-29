import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { UnifiedEventDto } from './unified-event.dto';
import { Type } from 'class-transformer';

export class TimepadSpecificDataDto {
  @ApiPropertyOptional({
    description: 'Показатель наличия бесплатных билетов',
    nullable: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isSendingFreeTickets: boolean | null;
}

export class TimepadDataDto extends UnifiedEventDto {
  @ApiProperty({
    description: 'Специфические для timepad данные',
    type: () => TimepadSpecificDataDto,
  })
  @ValidateNested()
  @Type(() => TimepadSpecificDataDto)
  specificData: TimepadSpecificDataDto;
}
