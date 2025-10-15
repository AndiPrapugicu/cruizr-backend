import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('premium_packages')
export class PremiumPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  premiumPoints: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceUSD: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceEUR: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceRON: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bonusPercentage: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  badge: string;

  @Column({ type: 'boolean', default: false })
  grantsVipStatus: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vipTitle: string;

  @Column({ type: 'int', nullable: true })
  vipDurationDays: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
