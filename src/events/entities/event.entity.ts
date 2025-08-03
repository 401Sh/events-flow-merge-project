import { EventThemeEntity } from "../../dictionaries/entities/theme.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EventAccess } from "../enums/event-access.enum";

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

  @OneToMany(() => EventThemeEntity, (theme) => theme.event)
  themes: EventThemeEntity[];
  
  @ManyToOne(
    () => UserEntity,
    (user) => user.events,
    { onDelete: 'SET NULL', nullable: true }
  )
  user: UserEntity;
}