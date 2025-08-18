import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LeaderParticipationEntity } from "../entities/leader-participation.entity";
import { Repository } from "typeorm";

@Injectable()
export class LeaderParticipationService {
  constructor(
    @InjectRepository(LeaderParticipationEntity)
    private leaderParticipationRepository: Repository<LeaderParticipationEntity>,
  ) {}

  async getEventParticipations(userId: number, eventId: number) {

  }
}