import { Controller, Get, HttpStatus } from '@nestjs/common';
import { DictionariesService } from './dictionaries.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventThemesList } from './dto/event-themes-list.dto';

@Controller('dictionaries')
export class DictionariesController {
  constructor(private dictionariesService: DictionariesService) {}

  @ApiOperation({
    summary: 'Получить общий список тем мероприятий',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список общий список тем',
    type: EventThemesList,
  })
  @Get('themes')
  async getEventThemes() {
    const themes = await this.dictionariesService.findEventThemes();

    return {
      data: themes,
    };
  }
}