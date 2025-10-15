// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MatchesModule } from './matches/matches.module';
import { ChatModule } from './chat/chat.module';
import { CarsModule } from './cars/cars.module';
import { BadgesModule } from './badges/badges.module';
import { FuelModule } from './fuel/fuel.module';
import { StoreModule } from './store/store.module';
import { PaymentsModule } from './payments/payments.module';
import { User } from './users/users.entity';
import { Match } from './matches/matches.entity';
import { Message } from './chat/chat.entity';
import { Swipe } from './swipes/swipe.entity';
import { Car } from './cars/car.entity';
import { Badge } from './badges/badge.entity';
import { UserBadge } from './badges/user-badge.entity';
import { Poll, PollVote } from './chat/poll.entity';
import { FuelWallet } from './fuel/entities/fuel-wallet.entity';
import { FuelTransaction } from './fuel/entities/fuel-transaction.entity';
import { PremiumPackage } from './fuel/entities/premium-package.entity';
import {
  StoreItem,
  UserInventory,
  StoreTransaction,
} from './store/store.entity';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // nu mai trebuie să importăm ConfigModule în fiecare modul
      envFilePath: '.env', // implicit e .env; poți schimba dacă folosești alt nume
    }),

    // 2) Apoi celelalte module
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [
        User,
        Match,
        Message,
        Swipe,
        Car,
        Badge,
        UserBadge,
        Poll,
        PollVote,
        FuelWallet,
        FuelTransaction,
        PremiumPackage,
        StoreItem,
        UserInventory,
        StoreTransaction,
      ],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    MatchesModule,
    ChatModule,
    CarsModule,
    BadgesModule,
    FuelModule,
    StoreModule,
    PaymentsModule,
  ],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class AppModule {}
