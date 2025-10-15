import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('methods')
  async getPaymentMethods(@Request() req) {
    const userId = req.user.userId;
    return this.paymentsService.getPaymentMethods(userId);
  }

  @Post('methods')
  async addPaymentMethod(@Request() req, @Body() paymentMethodData: any) {
    const userId = req.user.userId;
    return this.paymentsService.addPaymentMethod(userId, paymentMethodData);
  }

  @Delete('methods/:methodId')
  async removePaymentMethod(
    @Request() req,
    @Param('methodId') methodId: string,
  ) {
    const userId = req.user.userId;
    return this.paymentsService.removePaymentMethod(userId, methodId);
  }

  @Post('setup-intent')
  async createSetupIntent(@Request() req) {
    const userId = req.user.userId;
    return this.paymentsService.createSetupIntent(userId);
  }
}
