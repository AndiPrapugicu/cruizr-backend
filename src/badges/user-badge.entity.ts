import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Badge } from './badge.entity';

@Entity('user_badges')
export class UserBadge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  badgeId: number;

  @Column({ default: 1 })
  progress: number; // current progress towards badge

  @Column({ default: false })
  isUnlocked: boolean;

  @CreateDateColumn()
  unlockedAt: Date;

  @ManyToOne(() => User, (user) => user.userBadges)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Badge)
  @JoinColumn({ name: 'badgeId' })
  badge: Badge;
}
