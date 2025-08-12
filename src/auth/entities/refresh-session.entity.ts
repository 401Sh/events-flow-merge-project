import { UserEntity } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';

@Entity('refresh-sessions')
export class RefreshSessionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 512, unique: true, nullable: false })
  refreshToken!: string;

  @Column({ type: 'varchar', length: 512 })
  userAgent: string;

  @Column({ type: 'varchar', length: 45 })
  ip: string;

  @Column({ type: 'varchar', length: 512 })
  fingerprint: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.refreshSessions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: UserEntity;
}