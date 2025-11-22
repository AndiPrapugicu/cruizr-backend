import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Badge } from './badge.entity';
import { UserBadge } from './user-badge.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgeRepository: Repository<UserBadge>,
    private dataSource: DataSource,
  ) {}

  async getAllBadges() {
    return this.badgeRepository.find({
      where: { isActive: true },
      order: { isRare: 'DESC', name: 'ASC' },
    });
  }

  async getBadgeCategories() {
    // Return predefined categories since badges don't have categories in the entity
    return [
      {
        id: 'all',
        name: 'All Badges',
        description: 'View all available badges',
        icon: '🏆',
        color: '#F59E0B',
      },
      {
        id: 'cars',
        name: 'Car Collection',
        description: 'Badges for adding and collecting cars',
        icon: '🚗',
        color: '#10B981',
      },
      {
        id: 'social',
        name: 'Social',
        description: 'Badges for matches and interactions',
        icon: '💕',
        color: '#EC4899',
      },
      {
        id: 'streaks',
        name: 'Streaks',
        description: 'Badges for consistent activity',
        icon: '🔥',
        color: '#EF4444',
      },
      {
        id: 'performance',
        name: 'Performance',
        description: 'Badges for high-performance cars',
        icon: '⚡',
        color: '#8B5CF6',
      },
      {
        id: 'special',
        name: 'Special Events',
        description: 'Limited time and special badges',
        icon: '🌟',
        color: '#6366F1',
      },
    ];
  }

  async getUserBadges(userId: number) {
    const userBadges = await this.userBadgeRepository.find({
      where: { userId, isUnlocked: true },
      relations: ['badge'],
      order: { unlockedAt: 'DESC' },
    });

    // Transform to the format expected by frontend
    return userBadges.map((userBadge) => ({
      id: userBadge.id,
      name: userBadge.badge.name,
      title: userBadge.badge.name, // alias
      description: userBadge.badge.description,
      icon: userBadge.badge.icon,
      earned: userBadge.isUnlocked,
      unlocked: userBadge.isUnlocked, // alias
      progress: userBadge.progress,
      color: userBadge.badge.color,
      isRare: userBadge.badge.isRare,
      category: userBadge.badge.category, // Add category
      unlockedAt: userBadge.unlockedAt,
    }));
  }

  async seedDefaultBadges() {
    const defaultBadges = [
      {
        key: 'first_car',
        name: 'First Ride',
        description: 'Added your first car to the garage',
        icon: '🚗',
        color: '#10B981',
        isRare: false,
        requiredCount: 1,
      },
      {
        key: 'car_collector',
        name: 'Collector',
        description: 'Own 3 or more cars',
        icon: '🏆',
        color: '#F59E0B',
        isRare: false,
        requiredCount: 3,
      },
      {
        key: 'modification_master',
        name: 'Mod Master',
        description: 'Added 5+ modifications to a car',
        icon: '🔧',
        color: '#8B5CF6',
        isRare: false,
        requiredCount: 5,
      },
      {
        key: 'speed_demon',
        name: 'Speed Demon',
        description: 'Own a car with 300+ horsepower',
        icon: '⚡',
        color: '#EF4444',
        isRare: true,
        requiredCount: 1,
      },
      {
        key: 'classic_lover',
        name: 'Classic Soul',
        description: 'Own a car older than 30 years',
        icon: '🏛️',
        color: '#6B7280',
        isRare: true,
        requiredCount: 1,
      },
      {
        key: 'eco_warrior',
        name: 'Eco Warrior',
        description: 'Own an electric or hybrid vehicle',
        icon: '🌿',
        color: '#059669',
        isRare: false,
        requiredCount: 1,
      },
      {
        key: 'first_match',
        name: 'Perfect Match',
        description: 'Got your first match',
        icon: '💕',
        color: '#EC4899',
        isRare: false,
        requiredCount: 1,
      },
      {
        key: 'chat_starter',
        name: 'Conversation Starter',
        description: 'Sent 10 messages',
        icon: '💬',
        color: '#3B82F6',
        isRare: false,
        requiredCount: 10,
      },
      // 🔥 STREAK BADGES
      {
        key: 'daily_driver',
        name: 'Daily Driver',
        description: 'Active in app for 7 consecutive days',
        icon: '🔥',
        color: '#EF4444',
        isRare: false,
        requiredCount: 7,
      },
      {
        key: 'car_enthusiast',
        name: 'Car Enthusiast',
        description: 'Active for 30 consecutive days',
        icon: '🚗💨',
        color: '#8B5CF6',
        isRare: true,
        requiredCount: 30,
      },
      {
        key: 'car_photographer',
        name: 'Car Photographer',
        description: 'Uploaded photos for 5 consecutive days',
        icon: '📸',
        color: '#10B981',
        isRare: false,
        requiredCount: 5,
      },
      // 🌟 SOCIAL BADGES
      {
        key: 'popular_ride',
        name: 'Popular Ride',
        description: 'Your car received 10 likes',
        icon: '⭐',
        color: '#F59E0B',
        isRare: false,
        requiredCount: 10,
      },
      {
        key: 'trendsetter',
        name: 'Trendsetter',
        description: 'First with this car model in the app',
        icon: '🏆',
        color: '#EC4899',
        isRare: true,
        requiredCount: 1,
      },
      // 🏆 SPECIAL EVENT BADGES
      {
        key: 'summer_cruiser',
        name: 'Summer Cruiser',
        description: 'Active during summer season',
        icon: '☀️',
        color: '#FCD34D',
        isRare: false,
        requiredCount: 1,
      },
      {
        key: 'romanian_pride',
        name: 'Romanian Pride',
        description: 'Own a Romanian-made vehicle',
        icon: '🇷🇴',
        color: '#DC2626',
        isRare: true,
        requiredCount: 1,
      },

      // ...existing badges...
    ];

    for (const badgeData of defaultBadges) {
      const existingBadge = await this.badgeRepository.findOne({
        where: { key: badgeData.key },
      });

      if (!existingBadge) {
        const badge = this.badgeRepository.create(badgeData);
        await this.badgeRepository.save(badge);
      }
    }
  }

  async checkAndAwardBadge(
    userId: number,
    badgeKey: string,
    currentProgress = 1,
  ) {
    const badge = await this.badgeRepository.findOne({
      where: { key: badgeKey, isActive: true },
    });

    if (!badge) return null;

    let userBadge = await this.userBadgeRepository.findOne({
      where: { userId, badgeId: badge.id },
    });

    if (!userBadge) {
      userBadge = this.userBadgeRepository.create({
        userId,
        badgeId: badge.id,
        progress: currentProgress,
        isUnlocked: currentProgress >= badge.requiredCount,
      });
    } else {
      userBadge.progress = Math.max(userBadge.progress, currentProgress);
      if (!userBadge.isUnlocked && userBadge.progress >= badge.requiredCount) {
        userBadge.isUnlocked = true;
        userBadge.unlockedAt = new Date();
      }
    }

    await this.userBadgeRepository.save(userBadge);

    if (userBadge.isUnlocked) {
      return { badge, userBadge };
    }

    return null;
  }

  // Badge checking methods for different actions
  async checkCarBadges(userId: number) {
    try {
      // Get user's cars count - PostgreSQL uses $1, $2 instead of ?
      const carsCount = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM cars WHERE "userId" = $1',
        [userId],
      );
      const count = parseInt(carsCount[0]?.count || '0');

      // Check badges
      await this.checkAndAwardBadge(userId, 'first_car', count);
      await this.checkAndAwardBadge(userId, 'car_collector', count);

      // Get all user's cars and check specific badges for each
      const cars = await this.dataSource.query(
        'SELECT year, horsepower, fuelType, mods FROM cars WHERE userId = ?',
        [userId],
      );

      for (const car of cars) {
        // Check performance badges
        if (car.horsepower && car.horsepower >= 300) {
          await this.checkAndAwardBadge(userId, 'speed_demon', 1);
        }

        // Check eco badges
        if (car.fuelType === 'Electric' || car.fuelType === 'Hibrid') {
          await this.checkAndAwardBadge(userId, 'eco_warrior', 1);
        }

        // Check classic badges
        if (car.year) {
          const currentYear = new Date().getFullYear();
          if (currentYear - car.year >= 30) {
            await this.checkAndAwardBadge(userId, 'classic_lover', 1);
          }
        }

        // Check modification badges
        if (car.mods) {
          const modsCount = car.mods.split(',').length;
          await this.checkAndAwardBadge(
            userId,
            'modification_master',
            modsCount,
          );
        }
      }
    } catch (error) {
      console.error('Error checking car badges:', error);
    }
  }

  async checkModificationBadges(userId: number, carId: number) {
    try {
      // Get modification count for this car - PostgreSQL uses $1, $2 instead of ?
      const car = await this.dataSource.query(
        'SELECT mods FROM cars WHERE id = $1 AND "userId" = $2',
        [carId, userId],
      );

      if (car[0]?.mods) {
        const modsCount = car[0].mods.split(',').length;
        await this.checkAndAwardBadge(userId, 'modification_master', modsCount);
      }
    } catch (error) {
      console.error('Error checking modification badges:', error);
    }
  }

  async checkPerformanceBadges(userId: number, horsepower: number) {
    try {
      if (horsepower >= 300) {
        await this.checkAndAwardBadge(userId, 'speed_demon', 1);
      }
    } catch (error) {
      console.error('Error checking performance badges:', error);
    }
  }

  async checkEcoBadges(userId: number, fuelType: string) {
    try {
      if (fuelType === 'Electric' || fuelType === 'Hibrid') {
        await this.checkAndAwardBadge(userId, 'eco_warrior', 1);
      }
    } catch (error) {
      console.error('Error checking eco badges:', error);
    }
  }

  async checkClassicBadges(userId: number, year: number) {
    try {
      const currentYear = new Date().getFullYear();
      if (currentYear - year >= 30) {
        await this.checkAndAwardBadge(userId, 'classic_lover', 1);
      }
    } catch (error) {
      console.error('Error checking classic badges:', error);
    }
  }

  // 🔥 STREAK SYSTEM METHODS
  async checkDailyLoginStreak(userId: number) {
    try {
      // This would normally track login dates in a separate table
      // For now, we'll simulate streak checking
      const streak = await this.getUserLoginStreak(userId);

      if (streak >= 7) {
        await this.checkAndAwardBadge(userId, 'daily_driver', streak);
      }

      if (streak >= 30) {
        await this.checkAndAwardBadge(userId, 'car_enthusiast', streak);
      }
    } catch (error) {
      console.error('Error checking daily login streak:', error);
    }
  }

  async checkPhotoUploadStreak(userId: number) {
    try {
      // Check consecutive days of photo uploads
      const streak = await this.getUserPhotoStreak(userId);

      if (streak >= 5) {
        await this.checkAndAwardBadge(userId, 'car_photographer', streak);
      }
    } catch (error) {
      console.error('Error checking photo upload streak:', error);
    }
  }

  // 🌟 SOCIAL BADGES METHODS
  async checkPopularityBadges(userId: number, carId: number) {
    try {
      // Check how many likes the car has received
      const likesCount = await this.getCarLikesCount(carId);

      if (likesCount >= 10) {
        await this.checkAndAwardBadge(userId, 'popular_ride', likesCount);
      }
    } catch (error) {
      console.error('Error checking popularity badges:', error);
    }
  }

  async checkTrendsetterBadge(userId: number, carModel: string) {
    try {
      // Check if user is first with this car model
      const isFirst = await this.isFirstWithCarModel(carModel);

      if (isFirst) {
        await this.checkAndAwardBadge(userId, 'trendsetter', 1);
      }
    } catch (error) {
      console.error('Error checking trendsetter badge:', error);
    }
  }

  // 🏆 SPECIAL EVENT BADGES
  async checkSeasonalBadges(userId: number) {
    try {
      const currentMonth = new Date().getMonth() + 1; // 1-12

      // Summer months (June, July, August)
      if (currentMonth >= 6 && currentMonth <= 8) {
        await this.checkAndAwardBadge(userId, 'summer_cruiser', 1);
      }
    } catch (error) {
      console.error('Error checking seasonal badges:', error);
    }
  }

  async checkRomanianPrideBadge(userId: number, carBrand: string) {
    try {
      const romanianBrands = ['Dacia', 'ARO', 'Oltcit'];

      if (romanianBrands.includes(carBrand)) {
        await this.checkAndAwardBadge(userId, 'romanian_pride', 1);
      }
    } catch (error) {
      console.error('Error checking Romanian pride badge:', error);
    }
  }

  // HELPER METHODS FOR STREAK TRACKING
  private async getUserLoginStreak(userId: number): Promise<number> {
    // This would query a user_activity table
    // For now, return a mock value
    return Math.floor(Math.random() * 15) + 1;
  }

  private async getUserPhotoStreak(userId: number): Promise<number> {
    // This would query photo upload dates
    // For now, return a mock value
    return Math.floor(Math.random() * 10) + 1;
  }

  private async getCarLikesCount(carId: number): Promise<number> {
    try {
      // This would query a car_likes table
      const result = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM car_likes WHERE carId = ?',
        [carId],
      );
      return parseInt(result[0]?.count || '0');
    } catch (error) {
      // If table doesn't exist, return mock data
      return Math.floor(Math.random() * 20);
    }
  }

  private async isFirstWithCarModel(carModel: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM cars WHERE model = ?',
        [carModel],
      );
      return parseInt(result[0]?.count || '0') === 1;
    } catch (error) {
      return false;
    }
  }

  private getTimeFilter(timeframe: string): string {
    const now = new Date();
    let filterDate: Date;

    switch (timeframe) {
      case 'daily':
        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return '';
    }

    return `AND ub.unlockedAt >= '${filterDate.toISOString()}'`;
  }

  private async getUserRank(userId: number): Promise<string> {
    try {
      const userStats = await this.dataSource.query(
        `
        SELECT 
          COUNT(DISTINCT ub.id) as badgeCount,
          COUNT(DISTINCT CASE WHEN b.isRare = 1 THEN ub.id END) as rareCount
        FROM user_badges ub
        LEFT JOIN badges b ON ub.badgeId = b.id
        WHERE ub.userId = ? AND ub.isUnlocked = 1
      `,
        [userId],
      );

      const { badgeCount, rareCount } = userStats[0] || {
        badgeCount: 0,
        rareCount: 0,
      };

      if (rareCount >= 5) return 'Legend';
      if (rareCount >= 3) return 'Expert';
      if (badgeCount >= 10) return 'Enthusiast';
      if (badgeCount >= 5) return 'Collector';
      if (badgeCount >= 1) return 'Beginner';
      return 'Newbie';
    } catch (error) {
      console.error('Error getting user rank:', error);
      return 'Newbie';
    }
  }

  private getMockLeaderboard(limit: number) {
    const mockUsers = [
      {
        userId: '1',
        username: 'CarMaster2024',
        badgeCount: 15,
        rareCount: 3,
        legendaryCount: 1,
        totalScore: 30,
        rank: 1,
        badges: [],
      },
      {
        userId: '2',
        username: 'SpeedDemon',
        badgeCount: 12,
        rareCount: 2,
        legendaryCount: 0,
        totalScore: 22,
        rank: 2,
        badges: [],
      },
      {
        userId: '3',
        username: 'TuningKing',
        badgeCount: 10,
        rareCount: 1,
        legendaryCount: 0,
        totalScore: 15,
        rank: 3,
        badges: [],
      },
    ];

    return mockUsers.slice(0, limit);
  }

  async getUserStats(userId: number) {
    console.log('📊 Getting user stats for user:', userId);

    try {
      // Get user's badge stats
      const userBadges = await this.userBadgeRepository.find({
        where: { userId, isUnlocked: true },
        relations: ['badge'],
      });

      const totalBadges = await this.badgeRepository.count({
        where: { isActive: true },
      });

      const rareCount = userBadges.filter((ub) => ub.badge.isRare).length;
      const rank = await this.getUserRank(userId);

      return {
        total: totalBadges,
        unlocked: userBadges.length,
        percentage:
          totalBadges > 0
            ? Math.round((userBadges.length / totalBadges) * 100)
            : 0,
        rareCount,
        legendaryCount: 0, // TODO: Add legendary badges
        completion: `${userBadges.length}/${totalBadges}`,
        streakDays: 0, // TODO: Calculate streak
        rank,
        nextRankProgress: 65, // TODO: Calculate next rank progress
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      // Return mock stats on error
      return {
        total: 25,
        unlocked: 8,
        percentage: 32,
        rareCount: 2,
        legendaryCount: 1,
        completion: '8/25',
        streakDays: 5,
        rank: 'Enthusiast',
        nextRankProgress: 65,
      };
    }
  }

  // 📊 REAL-TIME BADGE PROGRESS TRACKING
  async getBadgeProgress(userId: number) {
    try {
      console.log('📊 Getting badge progress for user:', userId);

      // Get all user's badges (locked and unlocked)
      const userBadges = await this.userBadgeRepository.find({
        where: { userId },
        relations: ['badge'],
      });

      // Get all available badges
      const allBadges = await this.getAllBadges();

      // Create progress map
      const progressMap = userBadges.reduce((acc, ub) => {
        acc[ub.badge.key] = {
          id: ub.id,
          progress: ub.progress,
          isUnlocked: ub.isUnlocked,
          unlockedAt: ub.unlockedAt,
          badge: ub.badge,
          progressPercentage: Math.round(
            (ub.progress / ub.badge.requiredCount) * 100,
          ),
        };
        return acc;
      }, {} as any);

      // Add missing badges with 0 progress
      allBadges.forEach((badge) => {
        if (!progressMap[badge.key]) {
          progressMap[badge.key] = {
            id: null,
            progress: 0,
            isUnlocked: false,
            unlockedAt: null,
            badge,
            progressPercentage: 0,
          };
        }
      });

      return {
        userId,
        badges: Object.values(progressMap),
        totalBadges: allBadges.length,
        unlockedCount: userBadges.filter((ub) => ub.isUnlocked).length,
        inProgressCount: userBadges.filter(
          (ub) => !ub.isUnlocked && ub.progress > 0,
        ).length,
      };
    } catch (error) {
      console.error('Error getting badge progress:', error);
      throw error;
    }
  }

  async getLeaderboard(timeframe: string = 'allTime', limit: number = 10) {
    console.log(
      '🏆 Getting leaderboard with timeframe:',
      timeframe,
      'limit:',
      limit,
    );

    try {
      const timeFilter = this.getTimeFilter(timeframe);
      const leaderboardData = await this.dataSource.query(
        `
        SELECT 
          u.id as userId,
          u.name as username,
          COUNT(DISTINCT ub.id) as badgeCount,
          COUNT(DISTINCT CASE WHEN b.isRare = 1 THEN ub.id END) as rareCount,
          SUM(CASE 
            WHEN b.isRare = 1 THEN 5 
            ELSE 1 
          END) as totalScore
        FROM user u
        LEFT JOIN user_badges ub ON u.id = ub.userId AND ub.isUnlocked = 1 ${timeFilter}
        LEFT JOIN badges b ON ub.badgeId = b.id
        GROUP BY u.id, u.name
        ORDER BY totalScore DESC, badgeCount DESC
        LIMIT ?
      `,
        [limit],
      );

      if (leaderboardData && leaderboardData.length > 0) {
        console.log(
          '✅ Using real leaderboard data:',
          leaderboardData.length,
          'users',
        );
        return leaderboardData.map((user, index) => ({
          userId: user.userId.toString(),
          username: user.username,
          badgeCount: parseInt(user.badgeCount) || 0,
          rareCount: parseInt(user.rareCount) || 0,
          legendaryCount: 0,
          totalScore: parseInt(user.totalScore) || 0,
          rank: index + 1,
          badges: [],
        }));
      }

      console.log('⚠️ No real users found, using mock data');
      return this.getMockLeaderboard(limit);
    } catch (error) {
      console.error(
        '❌ Error getting leaderboard, using mock data:',
        error.message,
      );
      return this.getMockLeaderboard(limit);
    }
  }

  async seedTestData() {
    console.log('🌱 Seeding test data...');

    try {
      await this.seedDefaultBadges();

      const users = await this.dataSource.query(
        'SELECT id, name FROM user LIMIT 5',
      );

      if (users.length === 0) {
        console.log('No users found, creating test users...');
        await this.dataSource.query(
          'INSERT INTO user (name, email, password) VALUES (?, ?, ?)',
          ['CarMaster2024', 'carmaster@test.com', 'password123'],
        );
        await this.dataSource.query(
          'INSERT INTO user (name, email, password) VALUES (?, ?, ?)',
          ['SpeedDemon', 'speeddemon@test.com', 'password123'],
        );
        await this.dataSource.query(
          'INSERT INTO user (name, email, password) VALUES (?, ?, ?)',
          ['TuningKing', 'tuningking@test.com', 'password123'],
        );
      }

      const updatedUsers = await this.dataSource.query(
        'SELECT id, name FROM user LIMIT 5',
      );
      const badges = await this.getAllBadges();

      for (const user of updatedUsers) {
        const badgesToGive = badges.slice(0, Math.floor(Math.random() * 5) + 1);

        for (const badge of badgesToGive) {
          const existingUserBadge = await this.userBadgeRepository.findOne({
            where: { userId: user.id, badgeId: badge.id },
          });

          if (!existingUserBadge) {
            await this.userBadgeRepository.save({
              userId: user.id,
              badgeId: badge.id,
              progress: badge.requiredCount,
              isUnlocked: true,
              unlockedAt: new Date(),
            });
          }
        }
      }

      console.log('✅ Test data seeded successfully!');
      return { success: true, message: 'Test data seeded successfully' };
    } catch (error) {
      console.error('❌ Error seeding test data:', error);
      return { success: false, message: error.message };
    }
  }

  async checkTables() {
    try {
      const tables = await this.dataSource.query(`
        SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);
      return tables.map((t) => t.name);
    } catch (error) {
      console.error('Error checking tables:', error);
      return [];
    }
  }
}
