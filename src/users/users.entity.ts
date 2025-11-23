// src/users/users.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Swipe } from '../swipes/swipe.entity';
import { Car } from '../cars/car.entity';
import { UserBadge } from '../badges/user-badge.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  carModel: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column('simple-array', { nullable: true })
  photos: string[];

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  @Column({ nullable: true })
  city: string;

  @Column('simple-array', { nullable: true })
  interests: string[];

  @Column('float', { nullable: true })
  latitude: number;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column('float', { nullable: true })
  longitude: number;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  pushNotifications: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'int', nullable: true })
  prefMinAge: number;

  @Column({ type: 'int', nullable: true })
  prefMaxAge: number;

  @Column({ type: 'int', nullable: true })
  prefDistance: number;

  @Column({ type: 'varchar', nullable: true })
  prefCarBrand: string;

  @Column({ default: false })
  prefWorldwide: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @OneToMany(() => Swipe, (swipe) => swipe.user)
  swipesMade: Swipe[];

  @OneToMany(() => Swipe, (swipe) => swipe.targetUser)
  swipesReceived: Swipe[];

  @OneToMany(() => Car, (car) => car.user)
  cars: Car[];

  @Column('simple-array', { nullable: true })
  carMods: string[];

  // ─────────── Setări notificări ───────────
  @Column({ default: true })
  notifySwipe: boolean;

  @Column({ default: true })
  notifyLikes: boolean;

  @Column({ default: true })
  notifyMessages: boolean;
  // ───────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────
  // Relația Many-To-Many auto-referențială pentru block/unblock
  // ─────────────────────────────────────────────────────────────────
  @ManyToMany(() => User, (user) => user.blockedBy)
  @JoinTable({
    name: 'user_blocks', // numele tabelei de legătură
    joinColumn: {
      name: 'userId', // coloana care ține id-ul celui care blochează
      referencedColumnName: 'id', // coloana User.id
    },
    inverseJoinColumn: {
      name: 'blockedUserId', // coloana care ține id-ul userului blocat
      referencedColumnName: 'id', // coloana User.id
    },
  })
  blockedUsers: User[];

  @ManyToMany(() => User, (user) => user.blockedUsers)
  blockedBy: User[];

  @Column({ nullable: true })
  gender: string; // 'male', 'female', 'other'

  @Column({ nullable: true })
  prefGender: string; // 'male', 'female', 'both'

  // Badge system relation
  @OneToMany(() => UserBadge, (userBadge) => userBadge.user)
  userBadges: UserBadge[];

  // VIP Status
  @Column({ default: false })
  isVip: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vipTitle: string | null;

  @Column({ type: 'timestamp', nullable: true })
  vipExpiresAt: Date | null;

  // Profile boost functionality
  @Column({ type: 'json', nullable: true })
  profileBoost: {
    type: string;
    expiresAt: Date;
    multiplier: number;
    startedAt: Date;
  } | null;

  // Highlight Profile Color
  @Column({ type: 'varchar', length: 7, nullable: true, default: '#FFD700' })
  highlightColor: string;
}
