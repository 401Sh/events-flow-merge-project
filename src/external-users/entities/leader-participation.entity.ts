import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LeaderParticipationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  eventId: number;

  @Column({ type: 'uuid', nullable: false })
  eventParticipationUuid: string;

  @Column({ type: 'integer', nullable: false })
  userId: number;
}