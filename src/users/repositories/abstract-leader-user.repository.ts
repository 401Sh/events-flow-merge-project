import { GetParticipantsQueryDto } from "../dto/get-participants-query.dto";
import { UserProfileDto } from "../dto/user-profile.dto";
import { VisitedEventsListResultDto } from "../dto/visited-event-list-result.dto";

export abstract class AbstractLeaderUserRepository {
  abstract getUser(userId: number): Promise<UserProfileDto>;
  abstract getUserParticipations(
    userId: number, 
    query: GetParticipantsQueryDto
  ): Promise<VisitedEventsListResultDto>;
}
