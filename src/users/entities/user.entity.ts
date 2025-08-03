import { RefreshSessionEntity } from '../../auth/entities/refresh-session.entity';
import { EventEntity } from '../../events/entities/event.entity';
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  BaseEntity,
  OneToMany
} from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => RefreshSessionEntity,
    (refreshSession) => refreshSession.user,
    { cascade: true, onDelete: 'CASCADE' }
  )
  refreshSessions: RefreshSessionEntity[];

  @OneToMany(() => EventEntity, (event) => event.user)
  events: EventEntity[];
}