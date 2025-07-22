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
  // localeDate в UTC
  const utcDate = fromZonedTime(localDate, tzOffset);
  // UTC в ISO 8601 с Z (UTC)
  const final_date = formatISO(utcDate, { representation: 'complete' });

  return final_date;
}


export function mapLeaderVisited(raw: any): VisitedEventDto {
  const tz = raw.timezone?.value || '+03:00';

  const fullInfo = parseFullInfo(raw.info);
  const shortDesc = extractShortDescription(fullInfo);

  const leaderObj: VisitedEvent = {
    id: raw.id,

    eventId: raw.eventId,
    completed: raw.completed,
    completedAt: raw.completedAt,
    signedUpAt: raw.createdAt,

    title: raw.name,
    description: shortDesc,
    startsAt: toIso(raw.dateStart, tz),
    endsAt: raw.dateEnd ? toIso(raw.dateEnd, tz) : null,

    registrationStart: raw.registrationDateStart
      ? toIso(raw.registrationDateStart, tz)
      : null,

    registrationEnd: raw.registrationDateEnd
      ? toIso(raw.registrationDateEnd, tz)
      : null,

    url: `https://leader-id.ru/events/${raw.eventId}`,
    posterUrl: raw.photo.full || null,

    source: EventAPISource.LEADER_ID,
  };

  return plainToInstance(VisitedEventDto, leaderObj);
}


function parseFullInfo(fullInfoRaw: string | undefined): any | null {
  if (!fullInfoRaw) return null;
  try {
    return JSON.parse(fullInfoRaw);
  } catch {
    return null;
  }
}


function extractShortDescription(fullInfo: any): string | null {
  if (!fullInfo?.blocks?.length) return null;

  const firstText = fullInfo.blocks[0]?.data?.text ?? '';
  const plainText = firstText.replace(/<[^>]*>/g, '').trim();
  return plainText ? plainText.slice(0, 200) : null;
}
