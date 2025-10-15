import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FuelService } from './fuel.service';
import { EarnFuelDto, SpendFuelDto, PurchasePremiumDto } from './dto/fuel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('fuel')
@UseGuards(JwtAuthGuard)
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Get('wallet')
  async getWallet(@Request() req) {
    const userId = req.user.userId;
    return this.fuelService.getWallet(userId);
  }

  @Post('earn')
  async earnFuel(@Request() req, @Body() earnFuelDto: EarnFuelDto) {
    const userId = req.user.userId;
    return this.fuelService.earnFuel(userId, earnFuelDto);
  }

  @Post('spend')
  async spendFuel(@Request() req, @Body() spendFuelDto: SpendFuelDto) {
    const userId = req.user.userId;
    return this.fuelService.spendFuel(userId, spendFuelDto);
  }

  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('limit', ParseIntPipe) limit = 50,
  ) {
    const userId = req.user.userId;
    return this.fuelService.getTransactions(userId, limit);
  }

  @Post('daily-login')
  async recordDailyLogin(@Request() req) {
    const userId = req.user.userId;
    return this.fuelService.recordDailyLogin(userId);
  }

  @Get('stats')
  async getStats(@Request() req) {
    const userId = req.user.userId;
    return this.fuelService.getStats(userId);
  }

  // Premium Points Endpoints
  @Get('premium/packages')
  async getPremiumPackages() {
    return this.fuelService.getPremiumPackages();
  }

  @Post('premium/purchase')
  async purchasePremiumPoints(
    @Request() req,
    @Body() purchaseDto: PurchasePremiumDto,
  ) {
    const userId = req.user.userId;
    return this.fuelService.purchasePremiumPoints(userId, purchaseDto);
  }

  @Post('premium/seed')
  async seedPremiumPackages() {
    return this.fuelService.seedPremiumPackages();
  }
}
