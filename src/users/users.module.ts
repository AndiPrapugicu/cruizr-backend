import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Swipe } from '../swipes/swipe.entity';
import { Match } from '../matches/matches.entity';
import { StoreModule } from '../store/store.module';
import { FuelModule } from '../fuel/fuel.module';
import { CarsModule } from '../cars/cars.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Swipe, Match]),
    forwardRef(() => StoreModule),
    forwardRef(() => FuelModule),
    forwardRef(() => CarsModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
