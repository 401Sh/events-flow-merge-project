import { parse, formatISO } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

/**
 * Converts a local date with time zone offset into ISO 8601 UTC format.
 *
 * @param dateStr - date string, e.g. "2024-05-28 00:10:43"
 * @param tzOffset - time zone offset, e.g. "+03:00"
 * @returns a string in UTC ISO format: "2024-05-27T21:10:43Z"
 */
export function localeDateToIso(dateStr: string, tzOffset: string): string {
  // parse string like local time (without timezone)
  const localDate = parse(dateStr, 'yyyy-MM-dd HH:mm:ss', new Date());

  if (tzOffset == '00:00') tzOffset = '+00:00';
  // localeDate в UTC
  const utcDate = fromZonedTime(localDate, tzOffset);
  // UTC в ISO 8601 с Z (UTC)
  const final_date = formatISO(utcDate, { representation: 'complete' });

  return final_date;
}