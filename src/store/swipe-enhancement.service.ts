import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreService } from './store.service';
import { FuelService } from '../fuel/fuel.service';
import { MatchesService } from '../matches/matches.service';
import { UsersService } from '../users/users.service';
import { AppGateway } from '../app.gateway';
import { Swipe } from '../swipes/swipe.entity';
import { User } from '../users/users.entity';

export interface SuperLikeDto {
  targetUserId: number;
  message?: string;
}

export interface SwipeRewindDto {
  lastSwipeId?: number;
}

export interface ProfileBoostDto {
  duration: number; // in hours
  multiplier: number;
}

@Injectable()
export class SwipeEnhancementService {
  constructor(
    @InjectRepository(Swipe)
    private swipeRepository: Repository<Swipe>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private storeService: StoreService,
    private fuelService: FuelService,
    private matchesService: MatchesService,
    private usersService: UsersService,
    private appGateway: AppGateway,
  ) {}

  // 🌟 SUPER LIKE FUNCTIONALITY
  async sendSuperLike(
    userId: number,
    dto: SuperLikeDto,
  ): Promise<{
    success: boolean;
    message: string;
    match?: boolean;
    superLikeId?: number;
  }> {
    console.log(
      '🌟 Sending Super Like from user',
      userId,
      'to',
      dto.targetUserId,
    );

    // Check if user has any super likes in inventory
    const availableSuperLike = await this.findAvailableSuperLike(userId);
    console.log('🔍 Available Super Like:', availableSuperLike);
    if (!availableSuperLike) {
      throw new BadRequestException(
        'Nu ai Super Likes disponibile. Cumpără din store!',
      );
    }

    // Check if already swiped this user recently
    const existingSwipe = await this.matchesService.checkRecentSwipe(
      userId,
      dto.targetUserId,
    );
    console.log('🔍 Recent swipe check result:', existingSwipe);
    if (existingSwipe) {
      throw new BadRequestException(
        'Ai dat deja swipe acestui utilizator recent',
      );
    }

    // Use one super like from inventory
    console.log(
      '🔍 About to use Super Like item:',
      availableSuperLike,
      'for user',
      userId,
    );
    const useResult = await this.storeService.useItem(
      userId,
      availableSuperLike,
    );
    console.log('🔍 Super Like use result:', useResult);
    if (!useResult.success) {
      throw new BadRequestException('Nu s-a putut folosi Super Like-ul');
    }

    // Create enhanced swipe
    const fromUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    const toUser = await this.userRepository.findOne({
      where: { id: dto.targetUserId },
    });

    if (!fromUser || !toUser) {
      throw new NotFoundException('User not found');
    }

    const swipe = this.swipeRepository.create({
      user: fromUser,
      targetUser: toUser,
      direction: 'right',
      userId: userId,
      targetUserId: dto.targetUserId,
    });

    const savedSwipe = await this.swipeRepository.save(swipe);

    // Check for match
    const matchResult = await this.matchesService.swipe(
      userId,
      dto.targetUserId,
      'right',
    );

    // Send enhanced notification to target user
    console.log('🔔 Sending Super Like notification to user', dto.targetUserId);
    this.appGateway.server
      .to(`user_${dto.targetUserId}`)
      .emit('notify_super_like', {
        fromUser: fromUser.name,
        userId: fromUser.id,
        message:
          dto.message || `${fromUser.name} ți-a trimis un Super Like! ⭐`,
        type: 'super_like',
        swipeId: savedSwipe.id,
      });
    console.log('✅ Super Like notification sent to user', dto.targetUserId);

    // Send usage notification to sender
    console.log('🔔 Sending usage notification to user', userId);
    this.appGateway.server.to(`user_${userId}`).emit('store_item_used', {
      itemId: 'super-like-5pack',
      itemName: 'Super Like',
      usesRemaining: useResult.usesRemaining,
      message: `Super Like trimis către ${toUser.name}! ⭐`,
    });
    console.log('✅ Usage notification sent to user', userId);

    return {
      success: true,
      message: 'Super Like trimis cu succes!',
      match: (matchResult as any)?.match || false,
      superLikeId: savedSwipe.id,
    };
  }

  // ↩️ SWIPE REWIND FUNCTIONALITY
  async rewindLastSwipe(userId: number): Promise<{
    success: boolean;
    message: string;
    rewindedSwipe?: any;
  }> {
    console.log('↩️ Rewinding last swipe for user', userId);

    // Check if user has swipe rewind in inventory
    const hasItem = await this.storeService.checkItemActive(
      userId,
      'reverse-swipe',
    );
    if (!hasItem) {
      throw new BadRequestException(
        'Nu ai Swipe Rewind disponibil. Cumpără din store!',
      );
    }

    // Get last swipe
    const lastSwipe = await this.swipeRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['targetUser'],
    });

    if (!lastSwipe) {
      throw new BadRequestException('Nu ai niciun swipe de anulat');
    }

    // Check if swipe is recent enough (within 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (lastSwipe.createdAt < fiveMinutesAgo) {
      throw new BadRequestException(
        'Swipe-ul este prea vechi pentru a fi anulat',
      );
    }

    // Use the rewind item
    const useResult = await this.storeService.useItem(userId, 'reverse-swipe');
    if (!useResult.success) {
      throw new BadRequestException('Nu s-a putut folosi Swipe Rewind');
    }

    // Delete the swipe
    await this.swipeRepository.remove(lastSwipe);

    // Send notification
    this.appGateway.server.to(`user_${userId}`).emit('store_item_used', {
      itemId: 'reverse-swipe',
      itemName: 'Swipe Rewind',
      usesRemaining: useResult.usesRemaining,
      message: `Swipe-ul către ${lastSwipe.targetUser.name} a fost anulat! ↩️`,
    });

    return {
      success: true,
      message: 'Swipe anulat cu succes!',
      rewindedSwipe: {
        targetUserId: lastSwipe.targetUserId,
        targetUserName: lastSwipe.targetUser.name,
        direction: lastSwipe.direction,
      },
    };
  }

  // 🚀 PROFILE BOOST FUNCTIONALITY
  async activateProfileBoost(
    userId: number,
    boostType:
      | 'spotlight-30min'
      | 'boost-3h'
      | 'super-boost-1h'
      | 'spotlight-boost-1h'
      | 'profile-boost-1h'
      | 'profile-boost-6h',
  ): Promise<{
    success: boolean;
    message: string;
    boostDetails?: any;
  }> {
    console.log(
      '🚀 Activating profile boost for user',
      userId,
      'type:',
      boostType,
    );

    // Map frontend/store boostType to actual inventory itemId
    const itemIdMapping = {
      'spotlight-30min': 'spotlight-30min',
      'boost-3h': 'boost-3h',
      'super-boost-1h': 'super-boost-1h',
      // Add mappings for store itemIds
      'spotlight-boost-1h': 'spotlight-boost-1h',
      'profile-boost-1h': 'profile-boost-1h',
      'profile-boost-6h': 'profile-boost-6h',
    };

    const actualItemId = itemIdMapping[boostType] || boostType;
    console.log(`🔄 Mapping ${boostType} → ${actualItemId}`);

    // Check if user has boost in inventory
    const hasItem = await this.storeService.checkItemActive(
      userId,
      actualItemId,
    );
    if (!hasItem) {
      throw new BadRequestException(
        'Nu ai acest boost disponibil. Cumpără din store!',
      );
    }

    // Get boost configuration (map to standard config if needed)
    const boostConfig = this.getBoostConfig(boostType);

    // Check if user already has an active boost
    const existingBoost = await this.checkActiveBoost(userId);
    if (existingBoost) {
      throw new BadRequestException(
        'Ai deja un boost activ. Așteaptă să expire.',
      );
    }

    // Activate the boost using the actual itemId
    const activateResult = await this.storeService.activateItem(userId, {
      itemId: actualItemId,
    });
    if (!activateResult.success) {
      throw new BadRequestException('Nu s-a putut activa boost-ul');
    }

    // Set boost in user profile
    await this.userRepository.update(userId, {
      profileBoost: {
        type: actualItemId,
        multiplier: boostConfig.multiplier,
        expiresAt: new Date(Date.now() + boostConfig.duration * 60 * 60 * 1000),
        startedAt: new Date(),
      } as any,
    });

    // Send notification
    this.appGateway.server.to(`user_${userId}`).emit('store_item_used', {
      itemId: actualItemId,
      itemName: boostConfig.name,
      message: `${boostConfig.name} activat! Vizibilitatea ta va crește ${boostConfig.multiplier}x pentru ${boostConfig.duration} ore! 🚀`,
    });

    return {
      success: true,
      message: 'Profile boost activat cu succes!',
      boostDetails: boostConfig,
    };
  }

  // 👁️ SEE WHO LIKED ME FUNCTIONALITY
  async revealLikes(userId: number): Promise<{
    success: boolean;
    message: string;
    likes?: any[];
  }> {
    console.log('👁️ Revealing likes for user', userId);

    // Check if user has reveal item
    const hasItem = await this.storeService.checkItemActive(
      userId,
      'see-who-liked',
    );
    if (!hasItem) {
      throw new BadRequestException(
        'Nu ai această opțiune disponibilă. Cumpără din store!',
      );
    }

    // Use the item
    const useResult = await this.storeService.useItem(userId, 'see-who-liked');
    if (!useResult.success) {
      throw new BadRequestException('Nu s-a putut folosi opțiunea');
    }

    // Get likes received
    const likes = await this.swipeRepository.find({
      where: {
        targetUserId: userId,
        direction: 'right',
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // Send notification
    this.appGateway.server.to(`user_${userId}`).emit('store_item_used', {
      itemId: 'see-who-liked',
      itemName: 'See Who Liked Me',
      usesRemaining: useResult.usesRemaining,
      message: `Ai descoperit ${likes.length} like-uri! 👁️`,
    });

    return {
      success: true,
      message: 'Like-urile au fost dezvăluite!',
      likes: likes.map((like) => ({
        userId: like.user.id,
        name: like.user.name,
        photoUrl: like.user.photoUrl || like.user.imageUrl,
        createdAt: like.createdAt,
      })),
    };
  }

  // 🔄 REFRESH SWIPE ZONE
  async refreshSwipeZone(userId: number): Promise<{
    success: boolean;
    message: string;
    newUsers?: any[];
  }> {
    console.log('🔄 Refreshing swipe zone for user', userId);

    const hasItem = await this.storeService.checkItemActive(
      userId,
      'refresh-swipe-zone',
    );
    if (!hasItem) {
      throw new BadRequestException(
        'Nu ai această opțiune disponibilă. Cumpără din store!',
      );
    }

    const useResult = await this.storeService.useItem(
      userId,
      'refresh-swipe-zone',
    );
    if (!useResult.success) {
      throw new BadRequestException('Nu s-a putut folosi opțiunea');
    }

    // Get user location
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.latitude || !user.longitude) {
      throw new BadRequestException('Locația nu este setată');
    }

    // Get fresh users (expand radius or reset recent swipes filter)
    const newUsers = await this.usersService.findNearbyExcludingRecentSwipes(
      userId,
      50, // Expanded radius
      user.latitude,
      user.longitude,
      1, // Only 1 day instead of 7
    );

    this.appGateway.server.to(`user_${userId}`).emit('store_item_used', {
      itemId: 'refresh-swipe-zone',
      itemName: 'Refresh Swipe Zone',
      usesRemaining: useResult.usesRemaining,
      message: `Zona de swipe a fost reîncărcată! ${newUsers.length} noi persoane disponibile! 🔄`,
    });

    return {
      success: true,
      message: 'Zona de swipe a fost reîncărcată!',
      newUsers: newUsers.slice(0, 20), // Limit to 20 users
    };
  }

  // Helper Methods
  private getBoostConfig(boostType: string) {
    const configs = {
      'spotlight-30min': {
        name: 'Spotlight',
        duration: 0.5, // 30 minutes
        multiplier: 3,
      },
      'boost-3h': {
        name: 'Profile Boost',
        duration: 3,
        multiplier: 5,
      },
      'super-boost-1h': {
        name: 'Super Boost',
        duration: 1,
        multiplier: 10,
      },
      // Add configurations for store itemIds
      'spotlight-boost-1h': {
        name: 'Spotlight Boost (1h)',
        duration: 1, // 1 hour
        multiplier: 50, // High visibility boost
      },
      'profile-boost-1h': {
        name: 'Profile Boost (1h)',
        duration: 1,
        multiplier: 10,
      },
      'profile-boost-6h': {
        name: 'Profile Boost (6h)',
        duration: 6,
        multiplier: 10,
      },
    };

    return configs[boostType] || configs['spotlight-30min'];
  }

  private async checkActiveBoost(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.profileBoost) return false;

    const boost = user.profileBoost as any;
    if (boost.expiresAt && new Date() > new Date(boost.expiresAt)) {
      // Boost expired, clean it up
      await this.userRepository.update(userId, { profileBoost: null as any });
      return false;
    }

    return true;
  }

  // Get user's active store items
  async getActiveStoreItems(userId: number): Promise<any[]> {
    return this.storeService.getActiveItems(userId);
  }

  // Check if user can use specific store item
  async canUseStoreItem(userId: number, itemId: string): Promise<boolean> {
    return this.storeService.checkItemActive(userId, itemId);
  }

  // Helper function to find any available Super Like item
  private async findAvailableSuperLike(userId: number): Promise<string | null> {
    const superLikeTypes = [
      'super-like-5pack',
      'super-like-3pack',
      'super-like-single',
      'super-like-10pack',
    ];

    for (const itemId of superLikeTypes) {
      const isActive = await this.storeService.checkItemActive(userId, itemId);
      if (isActive) {
        console.log(`🌟 Found active Super Like: ${itemId} for user ${userId}`);
        return itemId;
      }
    }

    console.log(`❌ No active Super Likes found for user ${userId}`);
    return null;
  }
}
