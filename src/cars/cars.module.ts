import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from './car.entity';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { BadgesModule } from '../badges/badges.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Car]),
    forwardRef(() => BadgesModule),
  ],
  providers: [CarsService],
  controllers: [CarsController],
  exports: [CarsService],
})
export class CarsModule {}
