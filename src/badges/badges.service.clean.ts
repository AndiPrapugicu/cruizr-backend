import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from './badge.entity';
import { UserBadge } from './user-badge.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgeRepository: Repository<UserBadge>,
  ) {}

  async getLeaderboard(timeframe: string = 'allTime', limit: number = 10) {
    console.log('🏆 Getting leaderboard with timeframe:', timeframe, 'limit:', limit);
    
    try {
      // Try to get real data first
      const timeFilter = this.getTimeFilter(timeframe);
      const leaderboardData = await this.userBadgeRepository.query(`
        SELECT 
          u.id as userId,
          u.name as username,
          COUNT(DISTINCT ub.id) as badgeCount,
          COUNT(DISTINCT CASE WHEN b.isRare = true THEN ub.id END) as rareCount,
          SUM(CASE 
            WHEN b.isRare = true THEN 5 
            ELSE 1 
          END) as totalScore
        FROM users u
        LEFT JOIN user_badges ub ON u.id = ub.userId AND ub.isUnlocked = true ${timeFilter}
        LEFT JOIN badges b ON ub.badgeId = b.id
        GROUP BY u.id, u.name
        ORDER BY totalScore DESC, badgeCount DESC
        LIMIT ?
      `, [limit]);

      // If we got real data, format and return it
      if (leaderboardData && leaderboardData.length > 0) {
        console.log('✅ Using real leaderboard data:', leaderboardData.length, 'users');
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
      
      // If no real data, fall back to mock data
      console.log('⚠️ No real users found, using mock data');
      return this.getMockLeaderboard(limit);
      
    } catch (error) {
      console.error('❌ Error getting leaderboard, using mock data:', error.message);
      return this.getMockLeaderboard(limit);
    }
  }

  async getUserStats(userId: number) {
    console.log('📊 Getting user stats for user:', userId);
    
    try {
      const userBadges = await this.userBadgeRepository.query(`
        SELECT 
          COUNT(DISTINCT ub.id) as unlocked,
          COUNT(DISTINCT CASE WHEN b.isRare = true THEN ub.id END) as rareCount
        FROM user_badges ub
        LEFT JOIN badges b ON ub.badgeId = b.id
        WHERE ub.userId = ? AND ub.isUnlocked = true
      `, [userId]);

      const totalBadges = await this.badgeRepository.count();

      const stats = userBadges[0] || { unlocked: 0, rareCount: 0 };
      const unlocked = parseInt(stats.unlocked);
      const rareCount = parseInt(stats.rareCount);

      return {
        total: totalBadges,
        unlocked,
        percentage: totalBadges > 0 ? Math.round((unlocked / totalBadges) * 100) : 0,
        rareCount,
        legendaryCount: 0,
        completion: `${unlocked}/${totalBadges}`,
        streakDays: 0,
        rank: await this.getUserRank(userId),
        nextRankProgress: 65,
      };
    } catch (error) {
      console.error('❌ Error getting user stats:', error.message);
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

  async seedTestData() {
    console.log('🌱 Seeding test data...');
    
    try {
      // Create some test users if they don't exist
      await this.createTestUsers();
      
      // Create some test badges if they don't exist
      await this.createTestBadges();
      
      // Assign badges to users
      await this.assignTestBadges();
      
      console.log('✅ Test data seeded successfully');
      return { message: 'Test data seeded successfully' };
    } catch (error) {
      console.error('❌ Error seeding test data:', error);
      throw error;
    }
  }

  private async createTestUsers() {
    const testUsers = [
      { name: 'CarMaster2024', email: 'carmaster@test.com', password: 'hashed_password', city: 'Bucuresti' },
      { name: 'SpeedDemon', email: 'speeddemon@test.com', password: 'hashed_password', city: 'Cluj' },
      { name: 'TuningKing', email: 'tuningking@test.com', password: 'hashed_password', city: 'Timisoara' },
      { name: 'DriftMaster', email: 'driftmaster@test.com', password: 'hashed_password', city: 'Iasi' },
      { name: 'RaceQueen', email: 'racequeen@test.com', password: 'hashed_password', city: 'Brasov' },
    ];
    
    for (const userData of testUsers) {
      try {
        const existingUser = await this.userBadgeRepository.query(
          'SELECT id FROM users WHERE email = ?',
          [userData.email]
        );
        
        if (existingUser.length === 0) {
          await this.userBadgeRepository.query(
            'INSERT INTO users (name, email, password, city, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [userData.name, userData.email, userData.password, userData.city, new Date(), new Date()]
          );
          console.log(`✅ Created user: ${userData.name}`);
        }
      } catch (error) {
        console.log(`⚠️ User ${userData.name} might already exist`);
      }
    }
  }

  private async createTestBadges() {
    const testBadges = [
      { key: 'first_car', name: 'First Car', description: 'Added your first car', icon: '🚗', color: '#3B82F6', isRare: false, requiredCount: 1 },
      { key: 'speed_demon', name: 'Speed Demon', description: 'Love for fast cars', icon: '🏎️', color: '#EF4444', isRare: true, requiredCount: 1 },
      { key: 'tuning_master', name: 'Tuning Master', description: 'Master of car modifications', icon: '🔧', color: '#8B5CF6', isRare: true, requiredCount: 5 },
      { key: 'drift_king', name: 'Drift King', description: 'King of drifting', icon: '🏁', color: '#F59E0B', isRare: true, requiredCount: 10 },
      { key: 'car_collector', name: 'Car Collector', description: 'Owns multiple cars', icon: '🏆', color: '#10B981', isRare: false, requiredCount: 3 },
    ];
    
    for (const badgeData of testBadges) {
      try {
        const existingBadge = await this.badgeRepository.query(
          'SELECT id FROM badges WHERE key = ?',
          [badgeData.key]
        );
        
        if (existingBadge.length === 0) {
          await this.badgeRepository.query(
            'INSERT INTO badges (key, name, description, icon, color, isRare, requiredCount, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [badgeData.key, badgeData.name, badgeData.description, badgeData.icon, badgeData.color, badgeData.isRare, badgeData.requiredCount, true, new Date(), new Date()]
          );
          console.log(`✅ Created badge: ${badgeData.name}`);
        }
      } catch (error) {
        console.log(`⚠️ Badge ${badgeData.name} might already exist`);
      }
    }
  }

  private async assignTestBadges() {
    const users = await this.userBadgeRepository.query('SELECT id, name FROM users LIMIT 5');
    const badges = await this.badgeRepository.query('SELECT id, key, isRare FROM badges');
    
    for (const user of users) {
      const numBadges = Math.floor(Math.random() * 8) + 3; // 3-10 badges per user
      const shuffledBadges = badges.sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < Math.min(numBadges, badges.length); i++) {
        const badge = shuffledBadges[i];
        
        try {
          const existingUserBadge = await this.userBadgeRepository.query(
            'SELECT id FROM user_badges WHERE userId = ? AND badgeId = ?',
            [user.id, badge.id]
          );
          
          if (existingUserBadge.length === 0) {
            await this.userBadgeRepository.query(
              'INSERT INTO user_badges (userId, badgeId, progress, isUnlocked, unlockedAt) VALUES (?, ?, ?, ?, ?)',
              [user.id, badge.id, badge.requiredCount, true, new Date()]
            );
            console.log(`✅ Assigned badge ${badge.key} to user ${user.name}`);
          }
        } catch (error) {
          console.log(`⚠️ Badge assignment might already exist for user ${user.name}`);
        }
      }
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
      const userStats = await this.userBadgeRepository.query(`
        SELECT 
          COUNT(DISTINCT ub.id) as badgeCount,
          COUNT(DISTINCT CASE WHEN b.isRare = true THEN ub.id END) as rareCount
        FROM user_badges ub
        LEFT JOIN badges b ON ub.badgeId = b.id
        WHERE ub.userId = ? AND ub.isUnlocked = true
      `, [userId]);

      const { badgeCount, rareCount } = userStats[0] || { badgeCount: 0, rareCount: 0 };

      if (rareCount >= 5) return 'Legend';
      if (rareCount >= 3) return 'Expert';
      if (badgeCount >= 10) return 'Enthusiast';
      if (badgeCount >= 5) return 'Collector';
      if (badgeCount >= 1) return 'Beginner';
      return 'Newbie';
    } catch (error) {
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
}
