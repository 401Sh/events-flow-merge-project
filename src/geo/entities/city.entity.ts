import { DEFAULT_SRID } from 'src/common/constants/geospatial.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  Point,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cities')
export class CityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  intName: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  posterUrl?: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: DEFAULT_SRID,
  })
  location: Point;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
