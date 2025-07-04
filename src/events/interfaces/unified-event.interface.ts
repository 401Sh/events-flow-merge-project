import { EventAPISource } from '../enums/event-source.enum'
import { EventLocation } from './event-location.interface'
import { EventThemes } from './event-themes.interface'

export interface UnifiedEvent {
  // id | id
  id: number,
  // name | full_name
  title: string,
  // description_short | info (но его словно всегда нет в данных)
  shortDescription: string | null,
  // description_html (видимо в формате html - проверить не удалось) |
  // info (в формате JSON - сложно привести к тексту, много лишней информации)
  // пока данное поле больше как заглушка
  fullDescription: string | null,
  /** Дата и время начала (ISO-8601) */
  // starts_at | date_start
  startsAt: string,
  /** Дата и время окончания (ISO-8601) */
  // ends_at | date_end
  endsAt: string | null,
  // у timepad нету | registrationStart
  registrationStart: string | null,
  // registration_data.sale_ends_at (у timepad это дата конца продаж билетов) | registrationEnd 
  registrationEnd: string | null
  // location?.country | space[0]?.address?.country
  // location?.city | space[0]?.address?.city
  // location?.address | space[0]?.address?.street + " " + space[0]?.address?.house
  location: EventLocation,
  // url | у leader этого нет - нужно формировать вручную https://leader-id.ru/events/{id}
  url: string | null,
  // poster_image.default_url | photo
  posterUrl: string | null,
  // categories[] | themes[]
  tags: EventThemes[],
  // organization.name | organizers[0]?.name (возможно вообще нет этого поля - api не совпадает с реальными данными)
  organizer: string | null,
  /** Откуда пришло это событие (timepad или leader-id) */
  source: EventAPISource
}