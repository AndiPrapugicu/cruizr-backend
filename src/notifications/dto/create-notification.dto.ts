import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { NotificationType } from '../notification.entity';

export class CreateNotificationDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  @IsOptional()
  fromUserId?: number;

  @IsEnum([
    'like',
    'super-like',
    'match',
    'message',
    'profile-view',
    'boost-activated',
  ])
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  actionUrl?: string;

  @IsOptional()
  metadata?: any;
}

export class MarkAsReadDto {
  @IsNumber({}, { each: true })
  notificationIds: number[];
}
