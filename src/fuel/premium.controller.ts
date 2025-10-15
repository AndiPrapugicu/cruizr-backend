import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FuelService } from './fuel.service';
import { SwipeEnhancementService } from '../store/swipe-enhancement.service';
import {
  SuperLikeDto,
  SwipeRewindDto,
  ProfileBoostDto,
} from '../store/swipe-enhancement.service';

interface CreatePaymentIntentDto {
  packageId: number;
  userId: number;
  currency: string;
}

interface ConfirmPaymentDto {
  paymentIntentId: string;
  packageId: number;
  userId: number;
}

@Controller('premium')
export class PremiumController {
  constructor(
    private readonly fuelService: FuelService,
    private readonly swipeEnhancementService: SwipeEnhancementService,
  ) {}

  @Get('packages')
  async getPremiumPackages() {
    return this.fuelService.getPremiumPackages();
  }

  @Post('seed')
  async seedPremiumPackages() {
    return this.fuelService.seedPremiumPackages();
  }

  @Post('purchase-test')
  async purchasePremiumTest(
    @Body() purchaseDto: { packageId: number; userId: number },
  ) {
    return this.fuelService.purchasePremiumPointsTest(
      purchaseDto.userId,
      purchaseDto.packageId,
    );
  }

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    try {
      const packages = await this.fuelService.getPremiumPackages();
      const selectedPackage = packages.find((pkg) => pkg.id === dto.packageId);

      if (!selectedPackage) {
        throw new Error('Package not found');
      }

      let amount: number;
      switch (dto.currency.toUpperCase()) {
        case 'EUR':
          amount = selectedPackage.priceEUR;
          break;
        case 'RON':
          amount = selectedPackage.priceRON;
          break;
        default:
          amount = selectedPackage.priceUSD;
      }

      const mockPaymentIntentId = `pi_test_${Date.now()}_${dto.packageId}`;

      return {
        success: true,
        clientSecret: `${mockPaymentIntentId}_secret`,
        paymentIntentId: mockPaymentIntentId,
        amount,
        currency: dto.currency,
        packageDetails: selectedPackage,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Post('confirm-payment')
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    try {
      if (dto.paymentIntentId.startsWith('pi_test_')) {
        const result = await this.fuelService.purchasePremiumPointsTest(
          dto.userId,
          dto.packageId,
        );

        return {
          success: true,
          message: 'Payment successful and premium points added (TEST MODE)',
          paymentIntentId: dto.paymentIntentId,
          premiumPoints: result.premiumPoints,
        };
      } else {
        return {
          success: false,
          message: 'Invalid payment intent ID',
        };
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 🌟 SUPER LIKE
  @Post('super-like')
  @UseGuards(JwtAuthGuard)
  async sendSuperLike(@Request() req, @Body() dto: SuperLikeDto) {
    try {
      const userId = +req.user.userId;
      return this.swipeEnhancementService.sendSuperLike(userId, dto);
    } catch (error) {
      console.error('Super Like Error:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'A apărut o eroare la trimiterea Super Like-ului',
      };
    }
  }

  // ↩️ SWIPE REWIND
  @Post('swipe-rewind')
  @UseGuards(JwtAuthGuard)
  async rewindLastSwipe(@Request() req) {
    const userId = +req.user.userId;
    return this.swipeEnhancementService.rewindLastSwipe(userId);
  }

  // 🚀 PROFILE BOOST
  @Post('profile-boost/:boostType')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async revealLikes(@Request() req) {
    const userId = +req.user.userId;
    return this.swipeEnhancementService.revealLikes(userId);
  }

  // 🔄 REFRESH SWIPE ZONE
  @Post('refresh-swipe-zone')
  @UseGuards(JwtAuthGuard)
  async refreshSwipeZone(@Request() req) {
    const userId = +req.user.userId;
    return this.swipeEnhancementService.refreshSwipeZone(userId);
  }

  // 📱 GET ACTIVE STORE ITEMS
  @Get('active-items')
  @UseGuards(JwtAuthGuard)
  async getActiveStoreItems(@Request() req) {
    const userId = +req.user.userId;
    return this.swipeEnhancementService.getActiveStoreItems(userId);
  }

  // 🛒 GET USER INVENTORY
  @Get('inventory')
  @UseGuards(JwtAuthGuard)
  async getUserInventory(@Request() req) {
    const userId = +req.user.userId;
    return this.swipeEnhancementService.getActiveStoreItems(userId);
  }
}
