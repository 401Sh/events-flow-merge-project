import { Controller, Get, Param, ParseEnumPipe } from '@nestjs/common';
import { EventAPISource } from 'src/events/enums/event-source.enum';
import { DictionariesService } from './dictionaries.service';

@Controller('dictionaries')
export class DictionariesController {
  constructor(private dictionariesService: DictionariesService) {}

  @Get('themes')
  async getEventThemes() {
    return await this.dictionariesService.getEventThemes();
  }


  @Get('themes/:source')
  async getEventThemesBySource(
    @Param('source', new ParseEnumPipe(EventAPISource)) source: EventAPISource,
  ) {
    return await this.dictionariesService.getEventThemesBySource(source);
  }
}
