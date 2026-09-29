import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ChecklistItem } from './checklist-item';

export type ServiceType = 'COOK' | 'CLEANING';
export type ChecklistPhase = 'PRE_SERVICE' | 'DURING_SERVICE' | 'POST_SERVICE';

@Entity('service_checklists')
@Index('idx_service_checklists_service_type', { synchronize: false })
@Index('idx_service_checklists_phase', { synchronize: false })
@Index('idx_service_checklists_active', { synchronize: false })
@Index(['serviceType', 'phase', 'checklistName'], { unique: true })
export class ServiceChecklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_type', type: 'varchar', length: 50 })
  serviceType: ServiceType;

  @Column({ name: 'checklist_name', type: 'varchar', length: 100 })
  checklistName: string;

  @Column({ name: 'phase', type: 'varchar', length: 50 })
  phase: ChecklistPhase;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ChecklistItem, (item) => item.checklist)
  items: ChecklistItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
