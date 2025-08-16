import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { EventEntity } from "src/events/entities/event.entity";

@Entity('participants')
export class ParticipantEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false, nullable: false })
  isApproved: boolean = false;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.participations)
  user: UserEntity;

  @ManyToOne(() => EventEntity, (event) => event.participants)
  event: EventEntity;
}