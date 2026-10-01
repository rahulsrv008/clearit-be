import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ServicePricing } from './service-pricing';
import { Booking } from './booking';
import { ServiceZoneArea } from './service-zone-area';

@Entity('service_areas')
export class ServiceArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 32, nullable: true, unique: false })
  code: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  region: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  pincode: string | null;

  @Column({ type: 'double precision', nullable: true })
  latitude: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude: number | null;

  @Column({ name: 'service_radius_km', type: 'int', default: 3 })
  serviceRadiusKm: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ServicePricing, (pricing) => pricing.serviceArea)
  pricing: ServicePricing[];

  @OneToMany(() => Booking, (booking) => booking.serviceArea)
  bookings: Booking[];

  @OneToMany(() => ServiceZoneArea, (area) => area.serviceArea, {
    cascade: true,
  })
  zoneAreas: ServiceZoneArea[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
