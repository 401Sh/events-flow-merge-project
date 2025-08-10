import { ApiProperty } from "@nestjs/swagger";
import { EventAccess } from "../enums/event-access.enum";
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { EventThemeDto } from "./event-theme.dto";

export class EventDto {
  @ApiProperty({
    description: 'Id мероприятия',
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Название мероприятия',
    type: String,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Описание мероприятия',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiProperty({
    description: 'Дата начала мероприятия',
    type: Date,
  })
  @IsDate()
  startsAt: Date;

  @ApiProperty({
    description: 'Дата окончания мероприятия',
    nullable: true,
    type: Date,
  })
  @IsOptional()
  @IsDate()
  endsAt: Date | null;

  @ApiProperty({
    description: 'Дата начала регистрации на мероприятие',
    nullable: true,
    type: Date,
  })
  @IsOptional()
  @IsDate()
  registrationStart: Date | null;

  @ApiProperty({
    description: 'Дата окончания регистрации на мероприятие',
    nullable: true,
    type: Date,
  })
  @IsOptional()
  @IsDate()
  registrationEnd: Date | null;

  @ApiProperty({
    description: 'Место проведения мероприятия',
    type: String,
  })
  @IsString()
  location: string;
  
  @ApiProperty({
    description: 'Ссылка на постер мероприятия',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  posterUrl: string | null;

  @ApiProperty({
    description: 'Опубликовано ли данное мероприятие',
    type: Boolean,
  })
  @IsBoolean()
  isPublished: boolean;

  @ApiProperty({
    description: 'Вид доступа к записи на мероприятие',
    enum: EventAccess,
  })
  @IsEnum(EventAccess)
  accessType: EventAccess;

  @ApiProperty({
    description: 'Список связанных с мероприятием категорий',
    isArray: true,
    type: () => EventThemeDto,
  })
  @ValidateNested({ each: true })
  @Type(() => EventThemeDto)
  themes: EventThemeDto[];
}