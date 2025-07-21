import { GetParticipantsQueryDto } from "../dto/get-participants-query.dto";

export abstract class AbstractLeaderUserRepository {
  abstract getUser(userId: number): Promise<any>;
  abstract getUserParticipations(
    userId: number, 
    query: GetParticipantsQueryDto
  ): Promise<any>;
}
