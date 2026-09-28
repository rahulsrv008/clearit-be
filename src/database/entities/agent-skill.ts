import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Agent } from './agent';
import { Skill } from './skill';

export type SkillTrainingStatus = 'UNVERIFIED' | 'IN_TRAINING' | 'VERIFIED';

@Entity('agent_skills')
@Unique(['agentId', 'skillId'])
export class AgentSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agent_id', type: 'uuid' })
  agentId: string;

  @ManyToOne(() => Agent, (agent) => agent.skills)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @ManyToOne(() => Skill, (skill) => skill.agentSkills)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  @Column({ type: 'boolean', default: false })
  selected: boolean;

  @Column({
    name: 'training_status',
    type: 'varchar',
    length: 30,
    default: 'UNVERIFIED',
  })
  trainingStatus: SkillTrainingStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
