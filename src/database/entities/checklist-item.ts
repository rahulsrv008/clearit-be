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
import { ServiceChecklist } from './service-checklist';
import { ChecklistItemProgress } from './checklist-item-progress';

@Entity('checklist_items')
@Index('idx_checklist_items_checklist_id', { synchronize: false })
@Index('idx_checklist_items_order', { synchronize: false })
export class ChecklistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'checklist_id', type: 'uuid' })
  checklistId: string;

  @ManyToOne(() => ServiceChecklist, (checklist) => checklist.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checklist_id' })
  checklist: ServiceChecklist;

  @Column({ name: 'task_name', type: 'varchar', length: 255 })
  taskName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'sequence_order', type: 'int', default: 0 })
  sequenceOrder: number;

  @Column({ name: 'is_required', type: 'boolean', default: true })
  isRequired: boolean;

  @Column({ name: 'estimated_time_minutes', type: 'int', nullable: true })
  estimatedTimeMinutes: number | null;

  @Column({ name: 'requires_photo', type: 'boolean', default: false })
  requiresPhoto: boolean;

  @Column({ name: 'requires_notes', type: 'boolean', default: false })
  requiresNotes: boolean;

  @OneToMany(() => ChecklistItemProgress, (progress) => progress.checklistItem)
  progress: ChecklistItemProgress[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
