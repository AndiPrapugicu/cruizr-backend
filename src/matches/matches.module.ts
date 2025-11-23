import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './matches.entity';
import { User } from '../users/users.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Swipe } from '../swipes/swipe.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AppGateway } from '../app.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, User, Swipe]),
    forwardRef(() => UsersModule),
    NotificationsModule,
  ],
  providers: [MatchesService, AppGateway],
  controllers: [MatchesController],
  exports: [MatchesService],
})
export class MatchesModule {}
