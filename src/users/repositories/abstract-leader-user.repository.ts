import { UnifiedEventDto } from "src/events/dto/unified-event.dto";

export abstract class AbstractLeaderUserRepository {
  abstract getUserParticipations(): Promise<UnifiedEventDto>;
}
