import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SwipeEnhancementService } from './swipe-enhancement.service';
import {
  SuperLikeDto,
  SwipeRewindDto,
  ProfileBoostDto,
} from './swipe-enhancement.service';

@Controller('store/actions')
@UseGuards(JwtAuthGuard)
export class StoreActionsController {
  constructor(
    private readonly swipeEnhancementService: SwipeEnhancementService,
  ) {}

  // 🌟 SUPER LIKE
  @Post('super-like')
  async sendSuperLike(@Request() req, @Body() dto: SuperLikeDto) {
    const userId = +req.user.userId;
    return this.swipeEnhancementService.sendSuperLike(userId, dto);
  }

  // ↩️ SWIPE REWIND
  @Post('swipe-rewind')
  async rewindLastSwipe(@Request() req) {
    const userId = +req.user.userId;
    return this.swipeEnhancementService.rewindLastSwipe(userId);
  }

  // 🚀 PROFILE BOOST
  @Post('profile-boost/:boostType')
  async activateProfileBoost(
    @Request() req,
    @Param('boostType')
    boostType:
      | 'spotlight-30min'
      | 'boost-3h'
      | 'super-boost-1h'
      | 'spotlight-boost-1h'
      | 'profile-boost-1h'
      | 'profile-boost-6h',
  ) {
    const userId = +req.user.userId;
    return this.swipeEnhancementService.activateProfileBoost(userId, boostType);
  }

  // 👁️ SEE WHO LIKED ME
  @Post('reveal-likes')
  async revealLikes(@Request() req) {
    const userId = +req.user.userId;
    return this.swipeEnhancementService.revealLikes(userId);
  }

  // 🔄 REFRESH SWIPE ZONE
  @Post('refresh-swipe-zone')
  async refreshSwipeZone(@Request() req) {
    const userId = +req.user.userId;
    return this.swipeEnhancementService.refreshSwipeZone(userId);
  }

  // 📱 GET ACTIVE STORE ITEMS
  @Get('active-items')
  async getActiveStoreItems(@Request() req) {
    const userId = +req.user.userId;
    return this.swipeEnhancementService.getActiveStoreItems(userId);
  }

  // 🔍 CHECK IF CAN USE ITEM
  @Get('can-use/:itemId')
  async canUseStoreItem(@Request() req, @Param('itemId') itemId: string) {
    const userId = +req.user.userId;
    const canUse = await this.swipeEnhancementService.canUseStoreItem(
      userId,
      itemId,
    );
    return { canUse, itemId };
  }
}
