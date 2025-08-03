import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { EventsService } from '../events.service';

@Injectable()
export class EventOwnerGuard implements CanActivate {
  private readonly logger = new Logger(EventOwnerGuard.name)

  constructor(
    private readonly eventsService: EventsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const eventId = request.params.eventId;

    const event = await this.eventsService.findById(eventId);

    if (event.user.id !== user.sub) {
      this.logger.log('Attempt to access resource, which does not belong to the user')
      throw new ForbiddenException('You do not own this resource');
    }

    return true;
  }
}
