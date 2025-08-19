import { Injectable } from "@nestjs/common";
import { VisitedEventDto } from "../dto/visited-event.dto";
import EditorJSHTML from 'editorjs-html';
import { localeDateToIso } from "src/common/functions/local-date-to-iso";
import { VisitedEvent } from "../interfaces/visited-event.interface";
import { EventAPISource } from "src/external-events/enums/event-source.enum";
import { plainToInstance } from "class-transformer";

@Injectable()
export class LeaderVisitedMapperService {
  private readonly editjsParser = EditorJSHTML();

  map = (raw: any): VisitedEventDto => {
    const tz = raw.timezone?.value || '+03:00';

    const description = this.extractDescription(raw.event?.info);

    const leaderObj: VisitedEvent = {
      uuid: raw.id,

      eventId: raw.eventId,
      isCompleted: raw.completed,
      completedAt: raw.completedAt || null,
      signedUpAt: localeDateToIso(raw.createdAt, tz),

      title: raw.event?.name,
      description: description,
      startsAt: raw.event?.dateStart
        ? localeDateToIso(raw.event!.dateStart, tz)
        : null,

      endsAt: raw.event?.dateEnd
        ? localeDateToIso(raw.event!.dateEnd, tz)
        : null,

      registrationStart: raw.event?.registrationDateStart
        ? localeDateToIso(raw.event!.registrationDateStart, tz)
        : null,

      registrationEnd: raw.event?.registrationDateEnd
        ? localeDateToIso(raw.event!.registrationDateEnd, tz)
        : null,

      url: `https://leader-id.ru/events/${raw.eventId}`,
      posterUrl: raw.event?.photo?.full || null,

      source: EventAPISource.LEADER_ID,
    };

    return plainToInstance(VisitedEventDto, leaderObj);
  }


  private extractDescription(fullInfoRaw: string | undefined): any | null {
    if (!fullInfoRaw) return null;

    const parsedJson = JSON.parse(fullInfoRaw);

    if (!parsedJson.blocks || !Array.isArray(parsedJson.blocks)) return null;

    const html = this.editjsParser.parse(parsedJson);

    return html;
  }
}