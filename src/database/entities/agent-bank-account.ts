import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Agent } from './agent';

@Entity('agent_bank_accounts')
export class AgentBankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agent_id', type: 'uuid' })
  agentId: string;

  @ManyToOne(() => Agent, (agent) => agent.bankAccounts)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ name: 'account_holder_name', type: 'varchar', length: 150, nullable: true })
  accountHolderName: string | null;

  @Column({ name: 'account_number', type: 'varchar', length: 100, nullable: true })
  accountNumber: string | null;

  @Column({ name: 'ifsc_code', type: 'varchar', length: 20, nullable: true })
  ifscCode: string | null;

  @Column({ name: 'bank_name', type: 'varchar', length: 150, nullable: true })
  bankName: string | null;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
