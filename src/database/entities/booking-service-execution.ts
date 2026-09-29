import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Booking } from './booking';

@Entity('booking_service_execution')
@Index('idx_booking_service_execution_booking_id', { synchronize: false })
export class BookingServiceExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'service_started_at', type: 'timestamptz', nullable: true })
  serviceStartedAt: Date | null;

  @Column({ name: 'service_completed_at', type: 'timestamptz', nullable: true })
  serviceCompletedAt: Date | null;

  @Column({ name: 'actual_duration_minutes', type: 'int', nullable: true })
  actualDurationMinutes: number | null;

  @Column({ name: 'photos_before', type: 'text', array: true, nullable: true })
  photosBefore: string[] | null; // Array of photo URLs

  @Column({ name: 'photos_during', type: 'text', array: true, nullable: true })
  photosDuring: string[] | null;

  @Column({ name: 'photos_after', type: 'text', array: true, nullable: true })
  photosAfter: string[] | null;

  @Column({ name: 'agent_signature_url', type: 'varchar', length: 500, nullable: true })
  agentSignatureUrl: string | null;

  @Column({ name: 'customer_signature_url', type: 'varchar', length: 500, nullable: true })
  customerSignatureUrl: string | null;

  @Column({ name: 'milestones', type: 'text', array: true, nullable: true })
  milestones: string[] | null; // JSON array of milestone logs

  @Column({ name: 'has_overage', type: 'boolean', default: false })
  hasOverage: boolean;

  @Column({ name: 'overage_minutes', type: 'int', default: 0 })
  overageMinutes: number;

  @Column({ name: 'overage_charge', type: 'decimal', precision: 10, scale: 2, nullable: true })
  overageCharge: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
