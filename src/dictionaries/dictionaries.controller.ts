import { Controller, Get, Param, ParseEnumPipe } from '@nestjs/common';
import { EventAPISource } from 'src/events/enums/event-source.enum';
import { DictionariesService } from './dictionaries.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { EventThemesList } from './dto/event-themes-list.dto';

@Controller('dictionaries')
export class DictionariesController {
  constructor(private dictionariesService: DictionariesService) {}

  @ApiOperation({ summary: 'Получить список тем мероприятий для leaderId или timepad'})
  @ApiParam({
    name: 'source',
    required: true,
    description: 'Источник тем: leaderId или timepad',
    example: 'timepad',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Список тем от источника',
    type: EventThemesList
  })
  @Get('themes/:source')
  async getEventThemesBySource(
    @Param('source', new ParseEnumPipe(EventAPISource)) source: EventAPISource,
  ) {
    return await this.dictionariesService.getEventThemesBySource(source);
  }
}
