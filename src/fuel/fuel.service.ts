import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuelWallet } from './entities/fuel-wallet.entity';
import {
  FuelTransaction,
  FuelTransactionType,
  FuelEarnReason,
} from './entities/fuel-transaction.entity';
import { PremiumPackage } from './entities/premium-package.entity';
import { User } from '../users/users.entity';
import {
  EarnFuelDto,
  SpendFuelDto,
  FuelStatsResponseDto,
  PurchasePremiumDto,
} from './dto/fuel.dto';
import { AppGateway } from '../app.gateway';

@Injectable()
export class FuelService {
  private readonly FUEL_RATES = {
    // Social Activities
    [FuelEarnReason.SWIPE_LIKE]: { amount: 2, maxDaily: 50 },
    [FuelEarnReason.MATCH_CREATED]: { amount: 10, maxDaily: 100 },
    [FuelEarnReason.MESSAGE_SENT]: { amount: 3, maxDaily: 30 },
    [FuelEarnReason.PROFILE_LIKED_BACK]: { amount: 8, maxDaily: 80 },

    // Car Activities
    [FuelEarnReason.CAR_ADDED]: { amount: 15, maxDaily: 75 },
    [FuelEarnReason.PHOTO_UPLOADED]: { amount: 5, maxDaily: 50 },
    [FuelEarnReason.VIDEO_ADDED]: { amount: 20, maxDaily: 100 },

    // Engagement Activities
    [FuelEarnReason.DAILY_LOGIN]: { amount: 5, maxDaily: 5 },
    [FuelEarnReason.WEEKLY_STREAK]: { amount: 5, maxDaily: 50 },
    [FuelEarnReason.PROFILE_COMPLETED]: { amount: 25, maxDaily: 25 },
    [FuelEarnReason.ACHIEVEMENT_UNLOCKED]: { amount: 10, maxDaily: 100 },

    // Premium Activities
    [FuelEarnReason.PREMIUM_BONUS]: { amount: 0, maxDaily: 0 },
    [FuelEarnReason.REFERRAL_BONUS]: { amount: 50, maxDaily: 250 },
    [FuelEarnReason.SEASONAL_BONUS]: { amount: 20, maxDaily: 100 },
  };

  constructor(
    @InjectRepository(FuelWallet)
    private fuelWalletRepository: Repository<FuelWallet>,
    @InjectRepository(FuelTransaction)
    private fuelTransactionRepository: Repository<FuelTransaction>,
    @InjectRepository(PremiumPackage)
    private premiumPackageRepository: Repository<PremiumPackage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private appGateway: AppGateway,
  ) {}

  async getOrCreateWallet(userId: number): Promise<FuelWallet> {
    let wallet = await this.fuelWalletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      wallet = this.fuelWalletRepository.create({
        userId,
        balance: 0,
        premiumPoints: 0,
        totalEarned: 0,
        totalSpent: 0,
        level: 1,
        streakDays: 0,
        lastLoginDate: new Date(),
        lastEarnDate: new Date(),
      });
      await this.fuelWalletRepository.save(wallet);
    }

    return wallet;
  }

  async getWallet(userId: number): Promise<FuelWallet> {
    const wallet = await this.fuelWalletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async earnFuel(
    userId: number,
    earnFuelDto: EarnFuelDto,
  ): Promise<FuelTransaction> {
    const wallet = await this.getOrCreateWallet(userId);
    const { reason, metadata } = earnFuelDto;

    const rate = this.FUEL_RATES[reason];
    if (!rate) {
      throw new BadRequestException(`Invalid earn reason: ${reason}`);
    }

    // Check daily limit
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const transactions = await this.fuelTransactionRepository.find({
      where: {
        wallet: { id: wallet.id },
        type: FuelTransactionType.EARNED,
        reason,
      },
      order: { createdAt: 'DESC' },
    });

    const todayTransactions = transactions.filter(
      (t) =>
        t.createdAt.toISOString().split('T')[0] === todayStr &&
        t.type === FuelTransactionType.EARNED,
    );

    const dailyEarned = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (dailyEarned >= rate.maxDaily) {
      throw new BadRequestException(`Daily limit reached for ${reason}`);
    }

    // Calculate amount with potential bonuses
    let amount = rate.amount;

    // Apply level bonus (5% per level above 1)
    if (wallet.level > 1) {
      amount = Math.floor(amount * (1 + (wallet.level - 1) * 0.05));
    }

    // Apply streak bonus for certain activities
    if (reason === FuelEarnReason.DAILY_LOGIN && wallet.streakDays > 0) {
      amount = Math.floor(amount * (1 + wallet.streakDays * 0.1));
    }

    // Ensure we don't exceed daily limit
    amount = Math.min(amount, rate.maxDaily - dailyEarned);

    if (amount <= 0) {
      throw new BadRequestException('No fuel can be earned at this time');
    }

    // Create transaction
    const transaction = this.fuelTransactionRepository.create({
      wallet,
      type: FuelTransactionType.EARNED,
      amount,
      reason,
      metadata,
      balanceAfter: Number(wallet.balance) + amount,
    });

    await this.fuelTransactionRepository.save(transaction);

    // Update wallet (ensure numeric addition, not string concatenation)
    wallet.balance = Number(wallet.balance) + amount;
    wallet.totalEarned = Number(wallet.totalEarned) + amount;
    wallet.lastEarnDate = new Date();

    // Update streak for login
    if (reason === FuelEarnReason.DAILY_LOGIN) {
      const lastLogin = wallet.lastLoginDate;
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      if (!lastLogin) {
        // First time login
        wallet.streakDays = 1;
      } else {
        // lastLogin exists, safe to use toDateString()
        const lastLoginDate = new Date(lastLogin);
        if (lastLoginDate.toDateString() === yesterday.toDateString()) {
          // Consecutive day
          wallet.streakDays += 1;
        } else if (lastLoginDate.toDateString() !== today.toDateString()) {
          // Streak broken or new streak
          wallet.streakDays = 1;
        }
        // If lastLogin.toDateString() === today.toDateString(), don't change streak (already logged in today)
      }

      wallet.lastLoginDate = today;
    }

    await this.fuelWalletRepository.save(wallet);

    return transaction;
  }

  async spendFuel(
    userId: number,
    spendFuelDto: SpendFuelDto,
  ): Promise<FuelTransaction> {
    const wallet = await this.getWallet(userId);
    const { amount, rewardId } = spendFuelDto;

    if (Number(wallet.balance) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create transaction
    const transaction = this.fuelTransactionRepository.create({
      wallet,
      type: FuelTransactionType.SPENT,
      amount,
      reason: FuelEarnReason.PREMIUM_BONUS, // Generic spend reason
      metadata: { rewardId },
      balanceAfter: Number(wallet.balance) - amount,
    });

    await this.fuelTransactionRepository.save(transaction);

    // Update wallet (ensure numeric subtraction, not string concatenation)
    wallet.balance = Number(wallet.balance) - amount;
    wallet.totalSpent = Number(wallet.totalSpent) + amount;

    await this.fuelWalletRepository.save(wallet);

    return transaction;
  }

  async recordDailyLogin(userId: number): Promise<{
    success: boolean;
    earned: number;
    streakDays: number;
    isNewDay: boolean;
  }> {
    const wallet = await this.getOrCreateWallet(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogin = wallet.lastLoginDate
      ? new Date(wallet.lastLoginDate)
      : null;
    const isNewDay =
      !lastLogin || lastLogin.toDateString() !== today.toDateString();

    if (!isNewDay) {
      // Already logged in today
      return {
        success: true,
        earned: 0,
        streakDays: wallet.streakDays,
        isNewDay: false,
      };
    }

    // Record daily login and earn fuel
    const transaction = await this.earnFuel(userId, {
      reason: FuelEarnReason.DAILY_LOGIN,
      metadata: { loginDate: today.toISOString() },
    });

    // Get updated wallet
    const updatedWallet = await this.getWallet(userId);

    return {
      success: true,
      earned: transaction.amount,
      streakDays: updatedWallet.streakDays,
      isNewDay: true,
    };
  }

  async getStats(userId: number): Promise<FuelStatsResponseDto> {
    const wallet = await this.getOrCreateWallet(userId);
    const transactions = await this.fuelTransactionRepository.find({
      where: { wallet: { id: wallet.id } },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayTransactions = transactions.filter(
      (t) =>
        t.createdAt.toISOString().split('T')[0] === todayStr &&
        t.type === FuelTransactionType.EARNED,
    );

    const weekTransactions = transactions.filter(
      (t) => t.createdAt >= weekStart && t.type === FuelTransactionType.EARNED,
    );

    const dailyEarned = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const weeklyEarned = weekTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      todayEarned: dailyEarned,
      weekEarned: weeklyEarned,
      monthEarned: 0, // TODO: Calculate monthly earnings
      totalTransactions: transactions.length,
      averageDaily: Math.round(weeklyEarned / 7),
      currentStreak: wallet.streakDays,
      bestStreak: wallet.streakDays, // TODO: Track best streak separately
    };
  }

  async getTransactions(
    userId: number,
    limit: number = 20,
  ): Promise<FuelTransaction[]> {
    const wallet = await this.getOrCreateWallet(userId);
    return this.fuelTransactionRepository.find({
      where: { wallet: { id: wallet.id } },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getPremiumPackages(): Promise<PremiumPackage[]> {
    return this.premiumPackageRepository.find({
      where: { isActive: true },
      order: { premiumPoints: 'ASC' },
    });
  }

  async purchasePremiumPoints(
    userId: number,
    purchaseDto: PurchasePremiumDto,
  ): Promise<{ success: boolean; transaction?: FuelTransaction }> {
    const wallet = await this.getOrCreateWallet(userId);
    const { packageId, paymentMethod } = purchaseDto;

    const premiumPackage = await this.premiumPackageRepository.findOne({
      where: { id: packageId, isActive: true },
    });

    if (!premiumPackage) {
      throw new NotFoundException('Premium package not found');
    }

    // In a real implementation, you would process payment here
    // For now, we'll simulate successful payment
    console.log(
      `Processing payment for package ${packageId} using ${paymentMethod}`,
    );

    // Add premium points to wallet
    wallet.premiumPoints += premiumPackage.premiumPoints;

    // Apply bonus if applicable
    if (premiumPackage.bonusPercentage > 0) {
      const bonusPoints = Math.floor(
        premiumPackage.premiumPoints * (premiumPackage.bonusPercentage / 100),
      );
      wallet.premiumPoints += bonusPoints;
    }

    await this.fuelWalletRepository.save(wallet);

    // Create transaction record
    const transaction = this.fuelTransactionRepository.create({
      wallet,
      type: FuelTransactionType.EARNED,
      amount: premiumPackage.premiumPoints,
      reason: FuelEarnReason.PREMIUM_BONUS,
      metadata: {
        packageId,
        packageName: premiumPackage.name,
        paymentMethod,
        bonusPercentage: premiumPackage.bonusPercentage,
      },
      balanceAfter: wallet.balance,
    });

    await this.fuelTransactionRepository.save(transaction);

    return { success: true, transaction };
  }

  async seedPremiumPackages(): Promise<{ success: boolean; message: string }> {
    // Clear existing packages
    await this.premiumPackageRepository.clear();

    const packages = [
      {
        name: 'Starter Pack',
        description: 'Perfect for beginners with 10% bonus points',
        premiumPoints: 100,
        priceUSD: 4.99,
        priceEUR: 4.49,
        priceRON: 23.99,
        icon: '🚗',
        isActive: true,
        isFeatured: false,
        bonusPercentage: 10,
        badge: 'STARTER',
        grantsVipStatus: false,
        vipTitle: undefined,
        vipDurationDays: undefined,
      },
      {
        name: 'Basic Pack',
        description: 'Great for regular users with 15% bonus points',
        premiumPoints: 250,
        priceUSD: 9.99,
        priceEUR: 8.99,
        priceRON: 49.99,
        icon: '⚡',
        isActive: true,
        isFeatured: false,
        bonusPercentage: 15,
        badge: 'BASIC',
        grantsVipStatus: false,
        vipTitle: undefined,
        vipDurationDays: undefined,
      },
      {
        name: 'Popular Pack',
        description: 'Most popular choice with 20% bonus points',
        premiumPoints: 500,
        priceUSD: 14.99,
        priceEUR: 13.99,
        priceRON: 74.99,
        icon: '🔥',
        isActive: true,
        isFeatured: true,
        bonusPercentage: 20,
        badge: 'POPULAR',
        grantsVipStatus: false,
        vipTitle: undefined,
        vipDurationDays: undefined,
      },
      {
        name: 'VIP Elite Pack',
        description: 'Premium experience with VIP status for 30 days',
        premiumPoints: 750,
        priceUSD: 24.99,
        priceEUR: 21.99,
        priceRON: 119.99,
        icon: '👑',
        isActive: true,
        isFeatured: true,
        bonusPercentage: 30,
        badge: 'VIP ELITE',
        grantsVipStatus: true,
        vipTitle: 'VIP Elite',
        vipDurationDays: 30,
      },
      {
        name: 'Value Pack',
        description: 'Great value with 25% bonus points',
        premiumPoints: 750,
        priceUSD: 19.99,
        priceEUR: 17.99,
        priceRON: 89.99,
        icon: '⭐',
        isActive: true,
        isFeatured: false,
        bonusPercentage: 25,
        badge: 'BEST VALUE',
        grantsVipStatus: false,
        vipTitle: undefined,
        vipDurationDays: undefined,
      },
      {
        name: 'Premium Pack',
        description: 'Maximum value with 30% bonus points',
        premiumPoints: 1000,
        priceUSD: 34.99,
        priceEUR: 31.99,
        priceRON: 159.99,
        icon: '💎',
        isActive: true,
        isFeatured: false,
        bonusPercentage: 30,
        badge: 'PREMIUM',
        grantsVipStatus: false,
        vipTitle: undefined,
        vipDurationDays: undefined,
      },
      {
        name: 'Diamond VIP Pack',
        description: 'Ultimate VIP experience with exclusive benefits',
        premiumPoints: 2500,
        priceUSD: 79.99,
        priceEUR: 69.99,
        priceRON: 359.99,
        icon: '💎',
        isActive: true,
        isFeatured: true,
        bonusPercentage: 40,
        badge: 'DIAMOND VIP',
        grantsVipStatus: true,
        vipTitle: 'Diamond VIP',
        vipDurationDays: 90,
      },
    ];

    for (const packageData of packages) {
      const premiumPackage = this.premiumPackageRepository.create(packageData);
      await this.premiumPackageRepository.save(premiumPackage);
    }

    return {
      success: true,
      message: `Successfully seeded ${packages.length} premium packages`,
    };
  }

  async purchasePremiumPointsTest(
    userId: number,
    packageId: number,
  ): Promise<{
    success: boolean;
    message: string;
    premiumPoints?: number;
    packageName?: string;
    pointsAdded?: number;
    bonusPoints?: number;
    totalPointsAdded?: number;
    vipGranted?: boolean;
    vipTitle?: string;
    vipDuration?: number;
  }> {
    console.log(
      `🎯 purchasePremiumPointsTest called with userId: ${userId}, packageId: ${packageId}`,
    );

    const wallet = await this.getOrCreateWallet(userId);
    console.log(
      `💰 Wallet retrieved for user ${userId}, current premium points: ${wallet.premiumPoints}`,
    );

    const premiumPackage = await this.premiumPackageRepository.findOne({
      where: { id: packageId, isActive: true },
    });

    if (!premiumPackage) {
      throw new NotFoundException('Premium package not found');
    }

    console.log(
      `📦 Premium package found: ${premiumPackage.name}, grants VIP: ${premiumPackage.grantsVipStatus}`,
    );

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add premium points to wallet (ensure numeric addition)
    wallet.premiumPoints = Number(wallet.premiumPoints) + premiumPackage.premiumPoints;
    wallet.premiumBalance = Number(wallet.premiumBalance) + premiumPackage.premiumPoints;

    // Apply bonus if applicable
    if (premiumPackage.bonusPercentage > 0) {
      const bonusPoints = Math.floor(
        premiumPackage.premiumPoints * (premiumPackage.bonusPercentage / 100),
      );
      wallet.premiumPoints = Number(wallet.premiumPoints) + bonusPoints;
      wallet.premiumBalance = Number(wallet.premiumBalance) + bonusPoints;
    }

    // Check if package grants VIP status
    if (premiumPackage.grantsVipStatus) {
      console.log(
        `👑 Granting VIP status: ${premiumPackage.vipTitle} for ${premiumPackage.vipDurationDays} days`,
      );
      await this.grantVipStatus(
        userId,
        premiumPackage.vipTitle,
        premiumPackage.vipDurationDays,
      );
    }

    await this.fuelWalletRepository.save(wallet);
    console.log(
      `💰 Wallet updated with new premium points: ${wallet.premiumPoints}`,
    );

    // Create transaction record
    const transaction = this.fuelTransactionRepository.create({
      wallet,
      type: FuelTransactionType.EARNED,
      amount: premiumPackage.premiumPoints,
      reason: FuelEarnReason.PREMIUM_BONUS,
      metadata: {
        packageId,
        packageName: premiumPackage.name,
        paymentMethod: 'TEST',
        bonusPercentage: premiumPackage.bonusPercentage,
        vipGranted: premiumPackage.grantsVipStatus,
      },
      balanceAfter: wallet.balance,
    });

    await this.fuelTransactionRepository.save(transaction);

    // Calculate bonus points and total points added
    const bonusPoints =
      premiumPackage.bonusPercentage > 0
        ? Math.floor(
            premiumPackage.premiumPoints *
              (premiumPackage.bonusPercentage / 100),
          )
        : 0;
    const totalPointsAdded = premiumPackage.premiumPoints + bonusPoints;

    // Emit WebSocket event for real-time wallet update
    const walletUpdateData = {
      userId,
      premiumPoints: wallet.premiumPoints,
      packageName: premiumPackage.name,
      pointsAdded: premiumPackage.premiumPoints,
      bonusPoints,
      totalPointsAdded,
      vipGranted: premiumPackage.grantsVipStatus,
      vipTitle: premiumPackage.vipTitle,
      vipDuration: premiumPackage.vipDurationDays,
      transactionId: transaction.id,
    };

    this.appGateway.server
      .to(`user_${userId}`)
      .emit('premiumWalletUpdate', walletUpdateData);
    console.log(
      `🔔 WebSocket event emitted to user_${userId}:`,
      walletUpdateData,
    );

    return {
      success: true,
      message: `Successfully purchased ${premiumPackage.name} for ${premiumPackage.premiumPoints} premium points`,
      premiumPoints: wallet.premiumPoints,
      packageName: premiumPackage.name,
      pointsAdded: premiumPackage.premiumPoints,
      bonusPoints,
      totalPointsAdded,
      vipGranted: premiumPackage.grantsVipStatus,
      vipTitle: premiumPackage.vipTitle,
      vipDuration: premiumPackage.vipDurationDays,
    };
  }

  async grantVipStatus(
    userId: number,
    vipTitle: string,
    durationDays: number,
  ): Promise<void> {
    console.log(
      `👑 grantVipStatus called for user ${userId}, title: ${vipTitle}, duration: ${durationDays} days`,
    );

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log(
      `👤 User found: ${user.name}, current VIP status: ${user.isVip}`,
    );

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + durationDays);

    user.isVip = true;
    user.vipTitle = vipTitle;
    user.vipExpiresAt = expirationDate;

    console.log(
      `✅ Setting VIP status: isVip=true, title=${vipTitle}, expires=${expirationDate.toISOString()}`,
    );

    await this.userRepository.save(user);

    console.log(`💾 User VIP status saved successfully`);
  }

  async checkVipStatus(
    userId: number,
  ): Promise<{ isVip: boolean; vipTitle?: string; expiresAt?: Date }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if VIP status has expired
    if (user.isVip && user.vipExpiresAt && new Date() > user.vipExpiresAt) {
      user.isVip = false;
      user.vipTitle = null;
      user.vipExpiresAt = null;
      await this.userRepository.save(user);
      return { isVip: false };
    }

    return {
      isVip: user.isVip,
      vipTitle: user.vipTitle || undefined,
      expiresAt: user.vipExpiresAt || undefined,
    };
  }

  // Store-specific methods for deducting balances
  async deductFuel(userId: number, amount: number): Promise<void> {
    const wallet = await this.getWallet(userId);

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient fuel balance');
    }

    // Create transaction for store purchase
    const transaction = this.fuelTransactionRepository.create({
      wallet,
      type: FuelTransactionType.SPENT,
      amount,
      reason: FuelEarnReason.PREMIUM_BONUS, // Store purchase reason
      metadata: { source: 'store_purchase' },
      balanceAfter: Number(wallet.balance) - amount,
    });

    await this.fuelTransactionRepository.save(transaction);

    // Update wallet (ensure numeric subtraction)
    wallet.balance = Number(wallet.balance) - amount;
    wallet.totalSpent = Number(wallet.totalSpent) + amount;
    await this.fuelWalletRepository.save(wallet);
  }

  async deductPremiumPoints(userId: number, amount: number): Promise<void> {
    const wallet = await this.getWallet(userId);

    if (Number(wallet.premiumBalance) < amount) {
      throw new BadRequestException('Insufficient premium balance');
    }

    // Create transaction for premium store purchase
    const transaction = this.fuelTransactionRepository.create({
      wallet,
      type: FuelTransactionType.SPENT,
      amount,
      reason: FuelEarnReason.PREMIUM_BONUS, // Premium store purchase reason
      metadata: { source: 'premium_store_purchase' },
      balanceAfter: Number(wallet.premiumBalance) - amount,
    });

    await this.fuelTransactionRepository.save(transaction);

    // Update wallet (ensure numeric subtraction)
    wallet.premiumBalance = Number(wallet.premiumBalance) - amount;
    await this.fuelWalletRepository.save(wallet);
  }
}
