import { EventAPISource } from "../enums/event-source.enum";
import { EventLocation } from "../interfaces/event-location.interface";
import { EventThemes } from "../interfaces/event-themes.interface";
import { UnifiedEvent } from "../interfaces/unified-event.interface";

export function mapTimepad(raw: any): UnifiedEvent {
  const location: EventLocation = {
    country: raw.location?.country || null,
    city: raw.location?.city || null,
    address: raw.location?.address || null,
  };

  const tags: EventThemes[] = (raw.categories || []).map(
    (t: EventThemes) => ({ id: t.id, name: t.name })
  );

  const timepadObj: UnifiedEvent = {
    id: raw.id,
    title: raw.name,
    shortDescription: raw.description_short || null,
    // тут нужно подумать над форматом
    // сейчас это html, что очень плохо, ведь у leader это json
    fullDescription: raw.description_html || null,
    startsAt: raw.starts_at,
    endsAt: raw.ends_at || null,
    registrationStart: null,
    registrationEnd: raw.registration_data?.sale_ends_at || null,
    url: raw.url || null,
    posterUrl: raw.poster_image?.default_url || null,
    organizer: raw.organization?.name || null,

    location: location,
    tags: tags,
    
    source: EventAPISource.TIMEPAD
  };

  return timepadObj;
}
