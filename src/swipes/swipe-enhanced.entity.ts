import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

export type SwipeType = 'left' | 'right' | 'up';
export type SwipeEnhancement = 'normal' | 'super_like' | 'boosted' | 'priority';

@Entity('swipes')
export class SwipeEnhanced {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  targetUserId: number;

  @Column({ type: 'varchar' })
  direction: SwipeType;

  @Column({ 
    type: 'varchar', 
    default: 'normal' 
  })
  enhancement: SwipeEnhancement;

  @Column({ 
    type: 'json', 
    nullable: true 
  })
  metadata?: {
    storeItemId?: string;
    fuelSpent?: number;
    premiumSpent?: number;
    boostLevel?: number;
    specialMessage?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.swipesMade, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, (user) => user.swipesReceived, { eager: true })
  @JoinColumn({ name: 'targetUserId' })
  targetUser: User;

  // Helper methods
  isSuperLike(): boolean {
    return this.enhancement === 'super_like';
  }

  isBoosted(): boolean {
    return this.enhancement === 'boosted' || this.enhancement === 'priority';
  }

  getDisplayName(): string {
    switch (this.enhancement) {
      case 'super_like':
        return 'Super Like ⭐';
      case 'boosted':
        return 'Boosted Like 🚀';
      case 'priority':
        return 'Priority Like 👑';
      default:
        return 'Like ❤️';
    }
  }
}
