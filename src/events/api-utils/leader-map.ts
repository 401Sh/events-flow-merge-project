import { parse, formatISO } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { EventAPISource } from '../enums/event-source.enum';
import { EventThemes } from '../../dictionaries/interfaces/event-themes.interface';
import { EventLocation } from '../interfaces/event-location.interface';
import { LeaderData } from '../interfaces/leader-data.interface';

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

  return final_date
}


export function mapLeader(raw: any): LeaderData {
  const tz = raw.timezone?.value || '+03:00';

  // извлечь короткое описание из JSON
  let shortDesc: string | null = null;

  let full_info: any = null;
  try {
    if (raw.full_info) {
      full_info = JSON.parse(raw.full_info);
    }
  } catch (e) {
    full_info = null;
  }
  
  // удаление HTML элементов после преобразования
  if (full_info?.blocks?.length > 0) {
    const firstText = full_info.blocks[0]?.data?.text ?? '';
    const plainText = firstText.replace(/<[^>]*>/g, '').trim();
    shortDesc = plainText ? plainText.slice(0, 200) : null;
  }

  const addr = raw.space?.address;
  const location: EventLocation = {
    country: addr?.titles?.country || null,
    city: addr?.city || null,
    address: addr ? `${addr.street ?? ''} ${addr.house ?? ''}`.trim() || null : null,
  };

  const tags: EventThemes[] = (raw.themes || []).map(
    (t: EventThemes) => ({ id: t.id, name: t.name })
  );

  const leaderObj: LeaderData = {
    id: raw.id,
    title: raw.full_name,
    shortDescription: shortDesc,
    // тут нужно подумать над форматом
    // сейчас это JSON, что очень плохо, ведь у timepad это html
    fullDescription: raw.full_info || null,
    startsAt: toIso(raw.date_start, tz),
    endsAt: raw.date_end ? toIso(raw.date_end, tz) : null,
    registrationStart: raw.registrationDateStart ? toIso(raw.registrationDateStart, tz) : null,
    registrationEnd: raw.registrationDateEnd ? toIso(raw.registrationDateEnd, tz) : null,
    // возможно стоит изменить
    url: `https://leader-id.ru/events/${raw.id}`,
    posterUrl: raw.photo || null,
    organizer: raw.organizers?.[0]?.name || null,

    location: location,
    tags: tags,

    source: EventAPISource.LEADER_ID,
    specificData: {
      participantsCount: raw.stat?.participants?.count || 0,
      participants: raw.stat?.participants?.list || []
    }
  };
  
  return leaderObj;
}
