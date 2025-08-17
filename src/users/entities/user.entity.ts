import { RefreshSessionEntity } from '../../auth/entities/refresh-session.entity';
import { EventEntity } from '../../events/entities/event.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { ParticipantEntity } from '../../participants/entities/participant.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  login?: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  isEmailConfirmed: boolean = false;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailConfirmationCode?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailConfirmationCodeExpiresAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => RefreshSessionEntity,
    (refreshSession) => refreshSession.user,
    { cascade: true, onDelete: 'CASCADE' },
  )
  refreshSessions: RefreshSessionEntity[];

  @OneToMany(() => EventEntity, (event) => event.user)
  events: EventEntity[];

  @OneToMany(() => ParticipantEntity, (participation) => participation.user)
  participations: ParticipantEntity[];
}