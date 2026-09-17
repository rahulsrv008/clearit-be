import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Service } from './service';
import { ServiceArea } from './service-area';

@Entity('service_pricing')
export class ServicePricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => Service, (service) => service.pricing)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'service_area_id', type: 'uuid', nullable: true })
  serviceAreaId: string | null;

  @ManyToOne(() => ServiceArea, (area) => area.pricing, { nullable: true })
  @JoinColumn({ name: 'service_area_id' })
  serviceArea: ServiceArea | null;

  @Column({ name: 'price_per_hour', type: 'decimal', precision: 10, scale: 2 })
  pricePerHour: string;

  @Column({
    name: 'agent_payout_per_hour',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  agentPayoutPerHour: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
