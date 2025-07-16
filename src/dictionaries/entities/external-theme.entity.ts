import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { EventThemeEntity } from './theme.entity';
import { EventAPISource } from 'src/events/enums/event-source.enum';

@Entity('external_themes')
export class ExternalThemeRefEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: EventAPISource, nullable: false })
  source: EventAPISource;

  @Column({ type: 'integer', nullable: false })
  sourceId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => EventThemeEntity, 
    eventTheme => eventTheme.externalRefs,
    { onDelete: 'CASCADE', nullable: false }
  )
  eventTheme: EventThemeEntity;
}