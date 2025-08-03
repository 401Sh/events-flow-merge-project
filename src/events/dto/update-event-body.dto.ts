import { ApiPropertyOptional } from "@nestjs/swagger";
import { EventAccess } from "../enums/event-access.enum";
import { ArrayUnique, IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString, Validate } from "class-validator";
import { Type } from "class-transformer";
import { IsDatesConsistent } from "../validators/event-date.validator";

export class UpdateEventBodyDto {
  @ApiPropertyOptional({
    description: 'Название мероприятия',
    type: String,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Описание мероприятия',
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Дата начала мероприятия',
    example: '2024-05-27T21:10:42Z',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startsAt?: Date;

  @ApiPropertyOptional({
    description: 'Дата окончания мероприятия',
    example: '2024-05-28T21:10:42Z',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endsAt?: Date;

  @ApiPropertyOptional({
    description: 'Дата начала регистрации на мероприятие',
    example: '2024-04-1T01:10:42Z',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  registrationStart?: Date;

  @ApiPropertyOptional({
    description: 'Дата окончания регистрации на мероприятие',
    example: '2024-05-27T18:20:45Z',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  registrationEnd?: Date;

  @ApiPropertyOptional({
    description: 'Место проведения мероприятия',
    type: String,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Опубликовано ли мероприятие ' +
      '(false - не опубликовано, true - опубликовано)',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Форма доступа записи на мероприятие.\n' +
      'public - мероприятие видно всем, link - мероприятие доступно по ссылке',
    enum: EventAccess,
  })
  @IsOptional()
  @IsEnum(EventAccess)
  accessType?: EventAccess;

  @ApiPropertyOptional({
    description: 'Список id тем, связанных с мероприятием',
    example: [1, 13, 5],
    isArray: true,
    type: () => Number,
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  themeIds?: number[];

  // validation trigger field
  @Validate(IsDatesConsistent)
  datesConsistencyCheck: any;
}