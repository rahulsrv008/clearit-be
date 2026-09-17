import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Agent } from './agent';
import { Booking } from './booking';

@Entity('agent_earnings')
export class AgentEarning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_agent_earnings_agent_id')
  @Column({ name: 'agent_id', type: 'uuid' })
  agentId: string;

  @ManyToOne(() => Agent, (agent) => agent.earnings)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId: string | null;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking | null;

  @Column({ name: 'service_hours', type: 'decimal', precision: 8, scale: 2, default: 0 })
  serviceHours: string;

  @Column({
    name: 'revenue_generated',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  revenueGenerated: string;

  @Column({
    name: 'earning_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  earningAmount: string;

  @Column({ name: 'earning_date', type: 'date', nullable: true })
  earningDate: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
