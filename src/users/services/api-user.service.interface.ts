import { GetParticipantsQueryDto } from "../dto/get-participants-query.dto";
import { SubscribeParticipationResultDto } from "../dto/subscribe-participation-result.dto";
import { UserProfileDto } from "../dto/user-profile.dto";
import { VisitedEventsListResultDto } from "../dto/visited-event-list-result.dto";
import { VisitedEventDto } from "../dto/visited-event.dto";

export interface APIUserInterface {
  getUser(userId: number): Promise<UserProfileDto>;
  getUserParticipations(
    token: string,
    userId: number, 
    query: GetParticipantsQueryDto,
  ): Promise<VisitedEventsListResultDto>;
  getUserEventHistory(
    token: string,
    userId: number, 
    isCompleted: boolean,
  ): Promise<VisitedEventDto[]>
  subscribeToEvent(
    token: any, 
    userId: number
  ): Promise<SubscribeParticipationResultDto>
  unsubscribeToEvent(
    token: any, 
    userId: number, 
    uuid: string
  ): Promise<any>
}
