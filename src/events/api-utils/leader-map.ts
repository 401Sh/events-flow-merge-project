import { parse, formatISO } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { UnifiedEvent } from '../interfaces/unified-event.interface';
import { EventAPISource } from '../enums/event-source.enum';
import { EventThemes } from '../interfaces/event-themes.interface';
import { EventLocation } from '../interfaces/event-location.interface';

// временная функция для приведения к одному формату времени с timepad
function toIso(dateStr: string, tz: string): string {
  // пример dateStr: "2021-04-29 10:00:00", tz: "+03:00"
  const parsed = parse(dateStr, 'yyyy-MM-dd HH:mm:ss', new Date());
  const utc = fromZonedTime(parsed, tz);
  return formatISO(utc);
}

export function mapLeader(raw: any): UnifiedEvent {
  const tz = raw.timezone?.value || '+03:00';

  // извлечь короткое описание из JSON
  let shortDesc: string | null = null;
  const info = JSON.parse(raw.info);
  const firstBlock = info.blocks?.[0]?.data?.text ?? '';
  shortDesc = firstBlock ? firstBlock.slice(0, 200) : null;

  const addr = raw.space[0]?.address;
  const location: EventLocation = {
    country: addr?.titles?.country || null,
    city: addr?.city || null,
    address: addr ? `${addr.street ?? ''} ${addr.house ?? ''}`.trim() || null : null,
  };

  const tags: EventThemes[] = (raw.themes || []).map(
    (t: EventThemes) => ({ id: t.id, name: t.name })
  );

  const leaderObj: UnifiedEvent = {
    id: raw.id,
    title: raw.full_name,
    shortDescription: shortDesc,
    // тут нужно подумать над форматом
    // сейчас это JSON, что очень плохо, ведь у timepad это html
    fullDescription: raw.info || null,
    startsAt: toIso(raw.date_start, tz),
    endsAt: raw.date_end ? toIso(raw.date_end, tz) : null,
    registrationStart: raw.registrationDateStart ? toIso(raw.registrationDateStart, tz) : null,
    registrationEnd: raw.registrationDateEnd ? toIso(raw.registrationDateEnd, tz) : null,
    // возможно стоит изменить
    url: `https://leader-id.ru/events/${raw.id}`,
    posterUrl: raw.photo || null,
    organizer: raw.organizers[0]?.name || null,

    location: location,
    tags: tags,
    
    source: EventAPISource.LEADER_ID,
  };
  
  return leaderObj;
}
