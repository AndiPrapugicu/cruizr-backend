import { IsEnum, IsNumber, IsOptional, IsString, IsObject } from 'class-validator';
import { FuelEarnReason } from '../entities/fuel-transaction.entity';

export class EarnFuelDto {
  @IsEnum(FuelEarnReason)
  reason: FuelEarnReason;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SpendFuelDto {
  @IsNumber()
  amount: number;

  @IsString()
  rewardId: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  currency?: 'fuel' | 'premium';
}

export class PurchasePremiumDto {
  @IsNumber()
  packageId: number;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsObject()
  paymentData?: Record<string, any>;
}

export class FuelWalletResponseDto {
  id: number;
  userId: number;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  premiumBalance: number;
  totalPremiumPurchased: number;
  totalPremiumSpent: number;
  dailyEarnings: Record<string, number>;
  weeklyEarnings: Record<string, number>;
  monthlyEarnings: Record<string, number>;
  earnLimits: Record<string, { current: number; max: number; resetDate: string }>;
  lastDailyLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class FuelTransactionResponseDto {
  id: number;
  type: string;
  amount: number;
  reason: string;
  description: string;
  metadata: Record<string, any>;
  balanceAfter: number;
  currency: 'fuel' | 'premium';
  createdAt: Date;
}

export class FuelStatsResponseDto {
  todayEarned: number;
  weekEarned: number;
  monthEarned: number;
  totalTransactions: number;
  averageDaily: number;
  currentStreak: number;
  bestStreak: number;
}

export class PremiumPackageResponseDto {
  id: number;
  name: string;
  premiumPoints: number;
  priceUSD: number;
  priceEUR: number;
  priceRON: number;
  originalPriceUSD: number;
  originalPriceEUR: number;
  originalPriceRON: number;
  discountPercent: number;
  category: string;
  description: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  validFrom: Date;
  validTo: Date;
  createdAt: Date;
  updatedAt: Date;
}
