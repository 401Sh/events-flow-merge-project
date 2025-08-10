import { UserEntity } from "../../users/entities/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EventAccess } from "../enums/event-access.enum";
import { EventThemeEntity } from "../../dictionaries/entities/theme.entity";

@Entity('events')
export class EventEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 512, default: null })
  description?: string;

  @Column({ type: 'timestamptz' })
  startsAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endsAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  registrationStart?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  registrationEnd?: Date;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  posterUrl?: string;

  @Column({ type: 'bool', default: false })
  isPublished: boolean = false;

  @Column({ type: 'enum', enum: EventAccess, default: EventAccess.PUBLIC })
  accessType: EventAccess = EventAccess.PUBLIC;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(
    () => EventThemeEntity,
    (theme) => theme.events,
    { cascade: true },
  )
  @JoinTable()
  themes: EventThemeEntity[];
  
  @ManyToOne(
    () => UserEntity,
    (user) => user.events,
    { onDelete: 'SET NULL', nullable: true }
  )
  user: UserEntity;
}