import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreController } from './store.controller';
import { StoreActionsController } from './store-actions.controller';
import { StoreService } from './store.service';
import { SwipeEnhancementService } from './swipe-enhancement.service';
import { StoreItem, UserInventory, StoreTransaction } from './store.entity';
import { Swipe } from '../swipes/swipe.entity';
import { User } from '../users/users.entity';
import { FuelModule } from '../fuel/fuel.module';
import { UsersModule } from '../users/users.module';
import { MatchesModule } from '../matches/matches.module';
import { AppGateway } from '../app.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StoreItem,
      UserInventory,
      StoreTransaction,
      Swipe,
      User,
    ]),
    forwardRef(() => FuelModule),
    forwardRef(() => UsersModule),
    forwardRef(() => MatchesModule),
  ],
  controllers: [StoreController, StoreActionsController],
  providers: [StoreService, SwipeEnhancementService, AppGateway],
  exports: [StoreService, SwipeEnhancementService],
})
export class StoreModule {}
