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

@Entity('swipes')
export class Swipe {
  @PrimaryGeneratedColumn()
  id: number; // ID autoincrementat

  @Column()
  userId: number; // corespunde coloanei foreign key pentru user-ul care face swipe-ul

  @Column()
  targetUserId: number; // corespunde coloanei foreign key pentru user-ul țintă

  @Column({ type: 'varchar' })
  direction: SwipeType; // direcția swipe-ului: 'left' | 'right' | 'up'

  @CreateDateColumn()
  createdAt: Date; // timestamp automat al creării

  // ManyToOne spre User – user care face swipe-ul
  @ManyToOne(() => User, (user) => user.swipesMade, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ManyToOne spre User – user care primește swipe-ul
  @ManyToOne(() => User, (user) => user.swipesReceived, { eager: true })
  @JoinColumn({ name: 'targetUserId' })
  targetUser: User;
}
