import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExternalThemeRefEntity } from './external-theme.entity';
import { EventEntity } from '../../events/entities/event.entity';

@Entity('event_themes')
export class EventThemeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  tag: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  posterUrl?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => ExternalThemeRefEntity,
    (externalRef) => externalRef.eventTheme,
    { cascade: true, onDelete: 'CASCADE' },
  )
  externalRefs: ExternalThemeRefEntity[];

  @ManyToOne(() => EventEntity, (event) => event.themes)
  event: EventEntity;
}
