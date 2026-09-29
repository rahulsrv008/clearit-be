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
import { Booking } from './booking';

export type PaymentMethod = 'RAZORPAY' | 'WALLET' | 'CASH';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type PayoutStatus = 'PENDING' | 'PROCESSED' | 'FAILED';

@Entity('booking_settlement')
@Index('idx_booking_settlement_booking_id', { synchronize: false })
@Index('idx_booking_settlement_payment_status', { synchronize: false })
@Index('idx_booking_settlement_payout_status', { synchronize: false })
export class BookingSettlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'base_amount', type: 'decimal', precision: 10, scale: 2 })
  baseAmount: string;

  @Column({ name: 'add_ons_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  addOnsAmount: string;

  @Column({ name: 'surge_charge', type: 'decimal', precision: 10, scale: 2, default: 0 })
  surgeCharge: string;

  @Column({ name: 'tax_percent', type: 'decimal', precision: 5, scale: 2 })
  taxPercent: string;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2 })
  taxAmount: string;

  @Column({ name: 'final_amount', type: 'decimal', precision: 10, scale: 2 })
  finalAmount: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50 })
  paymentMethod: PaymentMethod;

  @Column({ name: 'razorpay_order_id', type: 'varchar', length: 100, nullable: true })
  razorpayOrderId: string | null;

  @Column({ name: 'razorpay_payment_id', type: 'varchar', length: 100, nullable: true })
  razorpayPaymentId: string | null;

  @Column({ name: 'razorpay_signature', type: 'varchar', length: 255, nullable: true })
  razorpaySignature: string | null;

  @Column({ name: 'payment_status', type: 'varchar', length: 30, default: 'PENDING' })
  paymentStatus: PaymentStatus;

  @Column({ name: 'payment_timestamp', type: 'timestamptz', nullable: true })
  paymentTimestamp: Date | null;

  @Column({ name: 'agent_commission_percent', type: 'decimal', precision: 5, scale: 2 })
  agentCommissionPercent: string;

  @Column({ name: 'agent_commission_amount', type: 'decimal', precision: 10, scale: 2 })
  agentCommissionAmount: string;

  @Column({ name: 'incentive_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  incentivePercent: string | null;

  @Column({ name: 'incentive_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  incentiveAmount: string;

  @Column({ name: 'agent_net_payout', type: 'decimal', precision: 10, scale: 2 })
  agentNetPayout: string;

  @Column({ name: 'payout_status', type: 'varchar', length: 30, default: 'PENDING' })
  payoutStatus: PayoutStatus;

  @Column({ name: 'payout_timestamp', type: 'timestamptz', nullable: true })
  payoutTimestamp: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
