import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FuelWallet } from './fuel-wallet.entity';

export enum FuelTransactionType {
  EARNED = 'earned',
  SPENT = 'spent',
  BONUS = 'bonus',
  REFUND = 'refund',
  PREMIUM_PURCHASED = 'premium_purchased',
  PREMIUM_SPENT = 'premium_spent'
}

export enum FuelEarnReason {
  // Social Activities
  SWIPE_LIKE = 'swipe_like',
  MATCH_CREATED = 'match_created',
  MESSAGE_SENT = 'message_sent',
  PROFILE_LIKED_BACK = 'profile_liked_back',
  
  // Content Activities  
  CAR_ADDED = 'car_added',
  VIDEO_ADDED = 'video_added',
  PROFILE_COMPLETED = 'profile_completed',
  PHOTO_UPLOADED = 'photo_uploaded',
  
  // Engagement
  DAILY_LOGIN = 'daily_login',
  WEEKLY_STREAK = 'weekly_streak',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  
  // Special Events
  REFERRAL_BONUS = 'referral_bonus',
  SEASONAL_BONUS = 'seasonal_bonus',
  PREMIUM_BONUS = 'premium_bonus'
}

@Entity('fuel_transactions')
export class FuelTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  walletId: number;

  @Column({
    type: 'varchar',
    length: 50
  })
  type: FuelTransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'fuel'
  })
  currency: 'fuel' | 'premium';

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true
  })
  reason?: FuelEarnReason;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balanceAfter: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => FuelWallet, wallet => wallet.transactions)
  @JoinColumn({ name: 'walletId' })
  wallet: FuelWallet;
}
