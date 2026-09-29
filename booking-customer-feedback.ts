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

@Entity('booking_customer_feedback')
@Index('idx_booking_customer_feedback_booking_id', { synchronize: false })
export class BookingCustomerFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'rating_stars', type: 'int', nullable: true })
  ratingStars: number | null; // 1-5

  @Column({ name: 'review_text', type: 'text', nullable: true })
  reviewText: string | null;

  @Column({ name: 'nps_score', type: 'int', nullable: true })
  npsScore: number | null; // 0-10

  @Column({ name: 'would_rebook', type: 'boolean', nullable: true })
  wouldRebook: boolean | null;

  @Column({ name: 'referral_interest', type: 'boolean', default: false })
  referralInterest: boolean;

  @Column({ name: 'testimonial_permission', type: 'boolean', default: false })
  testimonialPermission: boolean;

  @Column({ name: 'feedback_submitted_at', type: 'timestamptz', nullable: true })
  feedbackSubmittedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
