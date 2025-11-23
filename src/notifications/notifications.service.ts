import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { User } from '../users/users.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    fromUserId?: number,
    metadata?: any,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      fromUserId,
      type,
      title,
      message,
      metadata,
      isRead: false,
    });

    // If there's a fromUser, get their photo for the notification
    if (fromUserId) {
      const fromUser = await this.userRepository.findOne({
        where: { id: fromUserId },
      });
      if (fromUser && fromUser.imageUrl) {
        notification.imageUrl = fromUser.imageUrl;
      }
    }

    return await this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { userId },
      relations: ['fromUser'],
      order: { createdAt: 'DESC' },
      take: 50, // Last 50 notifications
    });
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { userId, isRead: false },
      relations: ['fromUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(notificationId: number, userId: number): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: true, readAt: new Date() },
    );
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async deleteNotification(
    notificationId: number,
    userId: number,
  ): Promise<void> {
    await this.notificationRepository.delete({ id: notificationId, userId });
  }

  // Helper methods for common notification types
  async notifyNewLike(targetUserId: number, fromUserId: number): Promise<void> {
    const fromUser = await this.userRepository.findOne({
      where: { id: fromUserId },
    });
    
    await this.createNotification(
      targetUserId,
      'like',
      'New Like! 💕',
      `${fromUser?.name || 'Someone'} liked your profile`,
      fromUserId,
      { likeId: fromUserId },
    );
  }

  async notifyNewSuperLike(
    targetUserId: number,
    fromUserId: number,
  ): Promise<void> {
    const fromUser = await this.userRepository.findOne({
      where: { id: fromUserId },
    });
    
    await this.createNotification(
      targetUserId,
      'super-like',
      'Super Like! ⭐',
      `${fromUser?.name || 'Someone'} sent you a Super Like!`,
      fromUserId,
      { superLikeId: fromUserId },
    );
  }

  async notifyNewMatch(
    userId1: number,
    userId2: number,
    matchId: number,
  ): Promise<void> {
    const [user1, user2] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId1 } }),
      this.userRepository.findOne({ where: { id: userId2 } }),
    ]);

    // Notify user1
    await this.createNotification(
      userId1,
      'match',
      'New Match! 🎉',
      `You matched with ${user2?.name || 'someone'}!`,
      userId2,
      { matchId },
    );

    // Notify user2
    await this.createNotification(
      userId2,
      'match',
      'New Match! 🎉',
      `You matched with ${user1?.name || 'someone'}!`,
      userId1,
      { matchId },
    );
  }

  async notifyNewMessage(
    recipientId: number,
    senderId: number,
    messagePreview: string,
  ): Promise<void> {
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });
    
    await this.createNotification(
      recipientId,
      'message',
      'New Message 💬',
      `${sender?.name || 'Someone'}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
      senderId,
      { senderId },
    );
  }
}
