import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class EventThemeDto {
  @ApiProperty({
    description: 'Id темы',
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Название темы',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Тег темы',
    type: String,
  })
  @IsString()
  tag: string;

  @ApiProperty({
    description: 'Ссылка на постер темы',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  posterUrl: string | null;
}