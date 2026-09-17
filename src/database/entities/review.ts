import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Rating } from './rating';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rating_id', type: 'uuid' })
  ratingId: string;

  @ManyToOne(() => Rating, (rating) => rating.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rating_id' })
  rating: Rating;

  @Column({ name: 'review_text', type: 'text', nullable: true })
  reviewText: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
