import { Injectable } from '@nestjs/common';
import { DictionariesService } from 'src/dictionaries/dictionaries.service';
import { formatISO, parseISO } from 'date-fns';
import { EventAPISource } from '../enums/event-source.enum';
import { EventLocation } from '../interfaces/event-location.interface';
import { TimepadData } from '../interfaces/timepad-data.interface';
import { TimepadDataDto } from '../dto/timepad-data.dto';
import { plainToInstance } from 'class-transformer';
import { EventThemesDto } from 'src/dictionaries/dto/event-themes.dto';
import { APIMapperInterface } from './api-interfaces/api-mapper.service.interface';

@Injectable()
export class TimepadEventMapperService
  implements APIMapperInterface<TimepadDataDto>
{
  constructor(private readonly dictionariesService: DictionariesService) {}

  map = async (raw: any) => {
    const location = this.mapLocation(raw.location);
    const themes = await this.mapThemes(raw.categories);

    // TODO: add short_description check
    const description = raw.description_html ? raw.description_html : null;

    const timepadObj: TimepadData = {
      id: raw.id,
      title: raw.name,
      description: description,
      startsAt: this.toIsoFromOffsetString(raw.starts_at),
      endsAt: this.toIsoFromOffsetString(raw.ends_at) || null,
      registrationStart: null,
      registrationEnd:
        this.toIsoFromOffsetString(raw.registration_data?.sale_ends_at) || null,
      url: raw.url || null,
      posterUrl: raw.poster_image?.default_url || null,
      organizer: raw.organization?.name || null,

      location,
      themes,

      source: EventAPISource.TIMEPAD,

      specificData: {
        isSendingFreeTickets: raw.is_sending_free_tickets ?? null,
      },
    };

    return plainToInstance(TimepadDataDto, timepadObj);
  };


  private mapLocation(rawLocation: any): EventLocation {
    return {
      country: rawLocation?.country || null,
      city: rawLocation?.city || null,
      address: rawLocation?.address || null,
    };
  }


  private async mapThemes(rawCategories: any[]): Promise<EventThemesDto[]> {
    if (!rawCategories?.length) return [];

    const sourceIds = rawCategories.map((c) => c.id);

    const themes =
      await this.dictionariesService.findEventThemesByExternalThemeIds(
        sourceIds,
        EventAPISource.TIMEPAD,
      );

    return themes;
  }


  /**
   * Converts a date string that includes a timezone offset (e.g. "+0300") into a
   * UTC ISO 8601 string with 'Z'.
   *
   * @param dateStr - date string with timezone offset, e.g.
   * "2050-01-01T00:00:00+0300"
   * @returns a string in UTC ISO format: e.g. "2049-12-31T21:00:00Z"
   */
  private toIsoFromOffsetString(dateStr?: string): string | null {
    if (!dateStr) return null;

    try {
      const date = parseISO(dateStr);
      return formatISO(date, { representation: 'complete' });
    } catch (e) {
      return null;
    }
  }
}