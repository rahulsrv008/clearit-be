import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Booking } from './booking';
import { ChecklistItemProgress } from './checklist-item-progress';

export type ChecklistProgressStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type ChecklistPhase = 'PRE_SERVICE' | 'DURING_SERVICE' | 'POST_SERVICE';

@Entity('booking_checklist_progress')
@Index('idx_booking_checklist_progress_booking_id', { synchronize: false })
@Index('idx_booking_checklist_progress_phase', { synchronize: false })
@Index('idx_booking_checklist_progress_status', { synchronize: false })
export class BookingChecklistProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'service_type', type: 'varchar', length: 50 })
  serviceType: string; // 'COOK', 'CLEANING'

  @Column({ name: 'current_phase', type: 'varchar', length: 50, default: 'PRE_SERVICE' })
  currentPhase: ChecklistPhase;

  @Column({ type: 'varchar', length: 30, default: 'PENDING' })
  status: ChecklistProgressStatus;

  @Column({ name: 'completion_percentage', type: 'int', default: 0 })
  completionPercentage: number;

  @OneToMany(() => ChecklistItemProgress, (itemProgress) => itemProgress.checklistProgress)
  itemProgress: ChecklistItemProgress[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
