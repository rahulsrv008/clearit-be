import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceArea } from './service-area';

@Entity('service_zone_areas')
export class ServiceZoneArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_area_id', type: 'uuid' })
  serviceAreaId: string;

  @ManyToOne(() => ServiceArea, (area) => area.zoneAreas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_area_id' })
  serviceArea: ServiceArea;

  @Column({ name: 'area_name', type: 'varchar', length: 150 })
  areaName: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  pincode: string | null;

  @Column({ name: 'buildings_cover', type: 'jsonb', default: [] })
  buildingsCover: string[];

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
