import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Booking } from './booking';
import { Customer } from './customer';
import { Agent } from './agent';
import { Review } from './review';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.ratings)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.ratings)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'agent_id', type: 'uuid' })
  agentId: string;

  @ManyToOne(() => Agent, (agent) => agent.ratings)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: string;

  @OneToMany(() => Review, (review) => review.rating)
  reviews: Review[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
