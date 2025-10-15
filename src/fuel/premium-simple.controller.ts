import { Controller, Get, Post, Body } from '@nestjs/common';
import { FuelService } from './fuel.service';

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
  constructor(private readonly fuelService: FuelService) {}

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
      // Get package details
      const packages = await this.fuelService.getPremiumPackages();
      const selectedPackage = packages.find((pkg) => pkg.id === dto.packageId);

      if (!selectedPackage) {
        throw new Error('Package not found');
      }

      // Get price based on currency
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

      // For development/testing, simulate Stripe payment intent
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
      // For development/testing, simulate successful payment
      // In production, this would verify with Stripe

      if (dto.paymentIntentId.startsWith('pi_test_')) {
        // Simulate successful payment and add premium points
        const result = await this.fuelService.purchasePremiumPointsTest(
          dto.userId,
          dto.packageId,
        );

        return {
          success: true,
          message: 'Payment successful and premium points added (TEST MODE)',
          paymentIntentId: dto.paymentIntentId,
          premiumPoints: result.premiumPoints,
          packageDetails: {
            id: dto.packageId,
            name: result.packageName || 'Premium Package',
            pointsAdded: result.pointsAdded || 0,
            bonusPoints: result.bonusPoints || 0,
            totalPoints: result.premiumPoints,
          },
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
}
