import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LeaderParticipationEntity } from "../entities/leader-participation.entity";
import { Repository } from "typeorm";
import { LeaderUserFetchService } from "./leader-user-fetch.service";

@Injectable()
export class LeaderParticipationService {
  private readonly logger = new Logger(LeaderParticipationService.name);

  constructor(
    @InjectRepository(LeaderParticipationEntity)
    private leaderParticipationRepository: Repository<LeaderParticipationEntity>,

    private leaderUserFetchService: LeaderUserFetchService,
  ) {}

  async getEventParticipations(
    token: string,
    userId: number,
    eventId: number,
  ) {
    const amount = await this.leaderParticipationRepository.count({
      where: {
        userId: userId,
      },
    });

    if (amount == 0) await this.createAllParticipation(token, userId);

    const participation = await this.leaderParticipationRepository.findOne({
      where: {
        userId: userId,
        eventId: eventId,
      },
    });

    return participation;
  }


  async addParticipation(userId: number, eventId: number) {
    const participation = new LeaderParticipationEntity();

    participation.userId = userId;
    participation.eventId = eventId;

    return await this.leaderParticipationRepository.save(participation);
  }


  async removeParticipation(userId: number, participationUuid: string) {
    const deleteResult = await this.leaderParticipationRepository.delete({
      userId: userId,
      eventParticipationUuid: participationUuid,
    });

    return deleteResult;
  }


  private async createAllParticipation(token: string, userId: number) {
    const events = await this.fetchUserParticipation(token, userId);

    const participationEntities = events.map(e => {
      const participation = new LeaderParticipationEntity();
      
      participation.eventId = e.eventId;
      participation.eventParticipationUuid = e.id;
      participation.userId = userId;

      return participation;
    })

    return await this.leaderParticipationRepository.save(participationEntities);
  }


  private async fetchUserParticipation(token: string, userId: number) {
    let page = 1;

    const firstPageData = await this.leaderUserFetchService.fetchVisitedEventPage(
      token,
      userId,
      page
    );

    const totalPages = firstPageData.meta.paginationPageCount;

    let allEvents = firstPageData.items || [];

    for (page += 1; page <= totalPages; page++) {
      const data = await this.leaderUserFetchService.fetchVisitedEventPage(
        token,
        userId,
        page
      );
  
      const rawEvents = data.items || [];

      allEvents.push(...rawEvents);
    }

    this.logger.debug('Leader participation list received and filtered successfully');
    return allEvents;
  }
}