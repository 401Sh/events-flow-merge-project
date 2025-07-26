import { parse, formatISO } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { plainToInstance } from 'class-transformer';
import { VisitedEventDto } from '../dto/visited-event.dto';
import { VisitedEvent } from '../interfaces/visited-event.interface';
import { EventAPISource } from 'src/events/enums/event-source.enum';

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


export function mapLeaderVisited(raw: any): VisitedEventDto {
  const tz = raw.timezone?.value || '+03:00';

  const description = extractDescription(raw.event?.info);

  const leaderObj: VisitedEvent = {
    uuid: raw.id,

    eventId: raw.eventId,
    completed: raw.completed,
    completedAt: raw.completedAt || null,
    signedUpAt: raw.createdAt,

    title: raw.name,
    description: description,
    startsAt: raw.event?.dateStart ? toIso(raw.event!.dateStart, tz) : null,
    endsAt: raw.event?.dateEnd ? toIso(raw.event!.dateEnd, tz) : null,

    registrationStart: raw.event?.registrationDateStart
      ? toIso(raw.event!.registrationDateStart, tz)
      : null,

    registrationEnd: raw.event?.registrationDateEnd
      ? toIso(raw.event!.registrationDateEnd, tz)
      : null,

    url: `https://leader-id.ru/events/${raw.eventId}`,
    posterUrl: raw.event?.photo?.full || null,

    source: EventAPISource.LEADER_ID,
  };

  return plainToInstance(VisitedEventDto, leaderObj);
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