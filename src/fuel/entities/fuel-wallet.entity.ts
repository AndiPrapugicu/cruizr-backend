import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { FuelTransaction } from './fuel-transaction.entity';

@Entity('fuel_wallets')
export class FuelWallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  premiumBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  premiumPoints: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarned: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPremiumPurchased: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPremiumSpent: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0 })
  streakDays: number;

  @Column({ type: 'datetime', nullable: true })
  lastLoginDate: Date;

  @Column({ type: 'datetime', nullable: true })
  lastEarnDate: Date;

  @Column({ type: 'json', nullable: true })
  dailyEarnings: Record<string, number>;

  @Column({ type: 'json', nullable: true })
  weeklyEarnings: Record<string, number>;

  @Column({ type: 'json', nullable: true })
  monthlyEarnings: Record<string, number>;

  @Column({ type: 'json', nullable: true })
  earnLimits: Record<string, { current: number; max: number; resetDate: string }>;

  @Column({ type: 'date', nullable: true })
  lastDailyLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => FuelTransaction, transaction => transaction.wallet)
  transactions: FuelTransaction[];
}
