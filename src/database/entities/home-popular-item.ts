import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { HomeCategory } from './home-category';
import { HomeCategoryOption } from './home-category-option';

/** "Most popular" cards on the customer home; tapping one opens its linked category/option. */
@Entity('home_popular_items')
export class HomePopularItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  subtitle: string | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ name: 'price_label', type: 'varchar', length: 60, nullable: true })
  priceLabel: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  badge: string | null;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rating: string | null;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => HomeCategory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: HomeCategory | null;

  @Column({ name: 'option_id', type: 'uuid', nullable: true })
  optionId: string | null;

  @ManyToOne(() => HomeCategoryOption, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'option_id' })
  option: HomeCategoryOption | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
