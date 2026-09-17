import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Agent } from './agent';

@Entity('agent_incentives')
export class AgentIncentive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agent_id', type: 'uuid' })
  agentId: string;

  @ManyToOne(() => Agent, (agent) => agent.incentives)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({
    name: 'revenue_generated',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  revenueGenerated: string;

  @Column({
    name: 'threshold_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 15000,
  })
  thresholdAmount: string;

  @Column({
    name: 'incentive_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  incentiveAmount: string;

  @Column({ type: 'varchar', length: 30, default: 'PENDING' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
