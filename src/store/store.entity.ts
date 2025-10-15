import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('store_items')
export class StoreItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  itemId: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  icon: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  currency: 'fuel' | 'premium';

  @Column()
  category: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column('int', { nullable: true })
  duration: number; // in hours

  @Column('int', { nullable: true })
  maxUses: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPermanent: boolean;

  @Column({ default: false })
  isLimited: boolean;

  @Column('int', { nullable: true })
  limitedQuantity: number;

  @Column('json', { nullable: true })
  requirements: {
    minLevel?: number;
    badges?: string[];
    achievements?: string[];
  };

  @Column('json', { nullable: true })
  effects: {
    boostMultiplier?: number;
    duration?: number;
    type?: 'visibility' | 'matching' | 'profile' | 'social' | 'access';
  };

  @Column('json', { nullable: true })
  metadata: {
    color?: string;
    animation?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('user_inventory')
export class UserInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  itemId: string;

  @Column()
  storeItemId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => StoreItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeItemId' })
  storeItem: StoreItem;

  @CreateDateColumn()
  purchaseDate: Date;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column('int', { nullable: true })
  usesRemaining: number;

  @Column({ default: false })
  isActive: boolean;

  @Column('json', { nullable: true })
  metadata: {
    activatedAt?: Date;
    totalUsed?: number;
  };

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('store_transactions')
export class StoreTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transactionId: string;

  @Column()
  userId: number;

  @Column()
  itemId: string;

  @Column()
  storeItemId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => StoreItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeItemId' })
  storeItem: StoreItem;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  currency: 'fuel' | 'premium';

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed' | 'refunded';

  @Column('json', { nullable: true })
  metadata: {
    paymentMethod?: string;
    transactionId?: string;
    refundReason?: string;
  };

  @CreateDateColumn()
  timestamp: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
