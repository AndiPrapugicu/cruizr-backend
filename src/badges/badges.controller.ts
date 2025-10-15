import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Post,
  Param,
} from '@nestjs/common';
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    name: string;
  };
}

@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllBadges() {
    return this.badgesService.getAllBadges();
  }

  @Get('my-badges')
  @UseGuards(JwtAuthGuard)
  async getMyBadges(@Request() req: AuthenticatedRequest) {
    return this.badgesService.getUserBadges(req.user.userId);
  }

  @Get('leaderboard')
  @UseGuards(JwtAuthGuard)
  async getLeaderboard(
    @Query('timeframe') timeframe: string = 'allTime',
    @Query('limit') limit: string = '10',
  ) {
    return this.badgesService.getLeaderboard(timeframe, parseInt(limit));
  }

  @Get('leaderboard-debug')
  async getLeaderboardDebug(
    @Query('timeframe') timeframe: string = 'allTime',
    @Query('limit') limit: string = '10',
  ) {
    return this.badgesService.getLeaderboard(timeframe, parseInt(limit));
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  async getBadgeCategories() {
    return this.badgesService.getBadgeCategories();
  }

  @Get('progress/:userId')
  async getBadgeProgress(@Param('userId') userId: string) {
    return this.badgesService.getBadgeProgress(parseInt(userId));
  }

  @Post('check-streaks/:userId')
  async checkUserStreaks(@Param('userId') userId: string) {
    const userIdInt = parseInt(userId);
    await this.badgesService.checkDailyLoginStreak(userIdInt);
    await this.badgesService.checkPhotoUploadStreak(userIdInt);
    await this.badgesService.checkSeasonalBadges(userIdInt);
    return { message: 'Streaks checked successfully' };
  }

  @Get('user-stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Request() req: AuthenticatedRequest) {
    return this.badgesService.getUserStats(req.user.userId);
  }

  @Get('seed')
  async seedBadges() {
    await this.badgesService.seedDefaultBadges();
    return { message: 'Default badges seeded successfully' };
  }

  @Post('seed-test-data')
  async seedTestData() {
    try {
      const result = await this.badgesService.seedTestData();
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Error seeding test data: ' + error.message,
      };
    }
  }

  @Get('debug-tables')
  async debugTables() {
    try {
      // Check if tables exist
      const tables = await this.badgesService.checkTables();
      return { tables };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('test')
  async testEndpoint() {
    return {
      message: 'Badges controller is working!',
      timestamp: new Date().toISOString(),
    };
  }
}
