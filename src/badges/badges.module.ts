import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { Badge } from './badge.entity';
import { UserBadge } from './user-badge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, UserBadge])],
  controllers: [BadgesController],
  providers: [BadgesService],
  exports: [BadgesService],
})
export class BadgesModule {}
