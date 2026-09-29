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
import { BookingChecklistProgress } from './booking-checklist-progress';
import { ChecklistItem } from './checklist-item';

@Entity('checklist_item_progress')
@Index('idx_checklist_item_progress_progress_id', { synchronize: false })
@Index('idx_checklist_item_progress_item_id', { synchronize: false })
export class ChecklistItemProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'checklist_progress_id', type: 'uuid' })
  checklistProgressId: string;

  @ManyToOne(() => BookingChecklistProgress, (progress) => progress.itemProgress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'checklist_progress_id' })
  checklistProgress: BookingChecklistProgress;

  @Column({ name: 'checklist_item_id', type: 'uuid' })
  checklistItemId: string;

  @ManyToOne(() => ChecklistItem, (item) => item.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checklist_item_id' })
  checklistItem: ChecklistItem;

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
