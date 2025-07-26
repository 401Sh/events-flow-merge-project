import { parse, formatISO } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { EventAPISource } from '../enums/event-source.enum';
import { EventLocation } from '../interfaces/event-location.interface';
import { LeaderData } from '../interfaces/leader-data.interface';
import { plainToInstance } from 'class-transformer';
import { LeaderDataDto } from '../dto/leader-data.dto';
import { EventThemesDto } from 'src/dictionaries/dto/event-themes.dto';

/**
 * Converts a local date with time zone offset into ISO 8601 UTC format.
 *
 * @param dateStr - date string, e.g. "2024-05-28 00:10:43"
 * @param tzOffset - time zone offset, e.g. "+03:00"
 * @returns a string in UTC ISO format: "2024-05-27T21:10:43Z"
 */
export function toIso(dateStr: string, tzOffset: string): string {
  // парсинг строки как локальное время (без временной зоны)
  const localDate = parse(dateStr, 'yyyy-MM-dd HH:mm:ss', new Date());

  if (tzOffset == '00:00') tzOffset = '+00:00'
  // localeDate в UTC
  const utcDate = fromZonedTime(localDate, tzOffset);
  // UTC в ISO 8601 с Z (UTC)
  const final_date = formatISO(utcDate, { representation: 'complete' });

  return final_date;
}


export function mapLeader(raw: any): LeaderDataDto {
  const tz = raw.timezone?.value || '+03:00';

  const description = extractDescription(raw.full_info);

  const location = mapLocation(raw.space?.address);
  const themes = mapThemes(raw.themes);

  const leaderObj: LeaderData = {
    id: raw.id,
    title: raw.full_name,
    description: description,
    startsAt: raw.date_start ? toIso(raw.date_start, tz) : null,
    endsAt: raw.date_end ? toIso(raw.date_end, tz) : null,

    registrationStart: raw.registrationDateStart
      ? toIso(raw.registrationDateStart, tz)
      : null,

    registrationEnd: raw.registrationDateEnd
      ? toIso(raw.registrationDateEnd, tz)
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


function extractDescription(fullInfoRaw: string | undefined): any | null {
  if (!fullInfoRaw) return null;

  const parsedJson = JSON.parse(fullInfoRaw);

  if (!parsedJson.blocks || !Array.isArray(parsedJson.blocks)) return null;

  const text = parsedJson.blocks
    .map(block => block.data?.text ?? '')
    .filter(text => text.trim().length > 0);

  if (text.length == 0) return null;

  return text.join('\n');
}


function mapLocation(addr: any): EventLocation {
  return {
    country: addr?.titles?.country || null,
    city: addr?.city || null,
    address: addr
      ? `${addr.street ?? ''} ${addr.house ?? ''}`.trim() || null
      : null,
  };
}


function mapThemes(rawThemes: any[]): EventThemesDto[] {
  return (rawThemes || []).map((t: EventThemesDto) => ({
    id: t.id,
    name: t.name,
  }));
}
