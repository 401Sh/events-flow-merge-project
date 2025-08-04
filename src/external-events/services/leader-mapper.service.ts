import { Injectable } from "@nestjs/common";
import { DictionariesService } from "src/dictionaries/dictionaries.service";
import { parse, formatISO } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { EventAPISource } from '../enums/event-source.enum';
import { EventLocation } from '../interfaces/event-location.interface';
import { LeaderData } from '../interfaces/leader-data.interface';
import { plainToInstance } from 'class-transformer';
import { LeaderDataDto } from '../dto/leader-data.dto';
import { EventThemesDto } from 'src/dictionaries/dto/event-themes.dto';
import { APIMapperInterface } from "./api-interfaces/api-mapper.service.interface";

@Injectable()
export class LeaderMapperService implements APIMapperInterface<LeaderDataDto> {
  constructor(private readonly dictionariesService: DictionariesService) {}

  map = async (raw: any) => {
    const tz = raw.timezone?.value || '+03:00';
  
    const description = this.extractDescription(raw.full_info);
  
    const location = this.mapLocation(raw.space?.address);
    const themes = await this.mapThemes(raw.themes);
  
    const leaderObj: LeaderData = {
      id: raw.id,
      title: raw.full_name,
      description: description,
      startsAt: raw.date_start ? this.toIso(raw.date_start, tz) : null,
      endsAt: raw.date_end ? this.toIso(raw.date_end, tz) : null,
  
      registrationStart: raw.registrationDateStart
        ? this.toIso(raw.registrationDateStart, tz)
        : null,
  
      registrationEnd: raw.registrationDateEnd
        ? this.toIso(raw.registrationDateEnd, tz)
        : null,
  
      url: `https://leader-id.ru/events/${raw.id}`,
      posterUrl: raw.photo || null,
      organizer: raw.organizers?.[0]?.name || null,
  
      location,
      themes,
  
      source: EventAPISource.LEADER_ID,
  
      specificData: {
        participantsCount: raw.stat?.participants?.count || 0,
        participants: raw.stat?.participants?.list || [],
      },
    };
  
    return plainToInstance(LeaderDataDto, leaderObj);
  }
  
  
  private extractDescription(fullInfoRaw: string | undefined): any | null {
    if (!fullInfoRaw) return null;
  
    const parsedJson = JSON.parse(fullInfoRaw);
  
    if (!parsedJson.blocks || !Array.isArray(parsedJson.blocks)) return null;
  
    const text = parsedJson.blocks
      .map((block) => block.data?.text ?? '')
      .filter((text) => text.trim().length > 0);
  
    if (text.length == 0) return null;
  
    return text.join('\n');
  }
  
  
  private mapLocation(addr: any): EventLocation {
    return {
      country: addr?.titles?.country || null,
      city: addr?.city || null,
      address: addr
        ? `${addr.street ?? ''} ${addr.house ?? ''}`.trim() || null
        : null,
    };
  }

  
  // TODO: Improve and add better 'other' theme logic
  private async mapThemes(rawThemes: any[]): Promise<EventThemesDto[]> {
    if (!rawThemes?.length) return [];
    
    const sourceIds = rawThemes.map((t) => t.id);

    const themes = await this.dictionariesService.findEventThemesByExternalThemeIds(
      sourceIds,
      EventAPISource.LEADER_ID,
    );

    return themes;
  }


  /**
   * Converts a local date with time zone offset into ISO 8601 UTC format.
   *
   * @param dateStr - date string, e.g. "2024-05-28 00:10:43"
   * @param tzOffset - time zone offset, e.g. "+03:00"
   * @returns a string in UTC ISO format: "2024-05-27T21:10:43Z"
   */
  private toIso(dateStr: string, tzOffset: string): string {
    // parse string like local time (without timezone)
    const localDate = parse(dateStr, 'yyyy-MM-dd HH:mm:ss', new Date());

    if (tzOffset == '00:00') tzOffset = '+00:00';
    // localeDate в UTC
    const utcDate = fromZonedTime(localDate, tzOffset);
    // UTC в ISO 8601 с Z (UTC)
    const final_date = formatISO(utcDate, { representation: 'complete' });

    return final_date;
  }
}