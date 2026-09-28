import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AgentSkill } from './agent-skill';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 80 })
  category: string;

  @Column({ name: 'training_track', type: 'varchar', length: 80 })
  trainingTrack: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ name: 'match_keywords', type: 'text', default: '' })
  matchKeywords: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => AgentSkill, (row) => row.skill)
  agentSkills: AgentSkill[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
