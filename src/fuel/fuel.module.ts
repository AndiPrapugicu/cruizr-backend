import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuelController } from './fuel.controller';
import { PremiumController } from './premium.controller';
import { FuelService } from './fuel.service';
import { FuelWallet } from './entities/fuel-wallet.entity';
import { FuelTransaction } from './entities/fuel-transaction.entity';
import { PremiumPackage } from './entities/premium-package.entity';
import { User } from '../users/users.entity';
import { AppGateway } from '../app.gateway';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FuelWallet,
      FuelTransaction,
      PremiumPackage,
      User,
    ]),
    forwardRef(() => StoreModule),
  ],
  controllers: [FuelController, PremiumController],
  providers: [FuelService, AppGateway],
  exports: [FuelService],
})
export class FuelModule {}
