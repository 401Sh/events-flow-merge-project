import { formatISO, parseISO } from "date-fns";
import { EventAPISource } from "../enums/event-source.enum";
import { EventLocation } from "../interfaces/event-location.interface";
import { EventThemes } from "../interfaces/event-themes.interface";
import { TimepadData } from "../interfaces/timepad-data.interface";
// import { htmlToText } from 'html-to-text'; для преобразования html

/**
 * Converts a date string that includes a timezone offset (e.g. "+0300")
 * into a UTC ISO 8601 string with 'Z'.
 * 
 * @param dateStr - date string with timezone offset, e.g. "2050-01-01T00:00:00+0300"
 * @returns a string in UTC ISO format: e.g. "2049-12-31T21:00:00Z"
 */
export function toIsoFromOffsetString(dateStr?: string): string | null {
  if (!dateStr) return null;

  try {
    const date = parseISO(dateStr);
    return formatISO(date, { representation: 'complete' });
  } catch (e) {
    return null;
  }
}

export function mapTimepad(raw: any): TimepadData {
  const location: EventLocation = {
    country: raw.location?.country || null,
    city: raw.location?.city || null,
    address: raw.location?.address || null,
  };

  const tags: EventThemes[] = (raw.categories || []).map(
    (t: EventThemes) => ({ id: t.id, name: t.name })
  );

  const timepadObj: TimepadData = {
    id: raw.id,
    title: raw.name,
    shortDescription: raw.description_short || null,
    // тут нужно подумать над форматом
    // сейчас это html, что очень плохо, ведь у leader это json
    fullDescription: raw.description_html || null,
    startsAt: toIsoFromOffsetString(raw.starts_at),
    endsAt: toIsoFromOffsetString(raw.ends_at) || null,
    registrationStart: null,
    registrationEnd: toIsoFromOffsetString(raw.registration_data?.sale_ends_at) || null,
    url: raw.url || null,
    posterUrl: raw.poster_image?.default_url || null,
    organizer: raw.organization?.name || null,

    location: location,
    tags: tags,

    source: EventAPISource.TIMEPAD,
    specificData: {
      isSendingFreeTickets: raw.is_sending_free_tickets || null
    }
  };

  return timepadObj;
}
