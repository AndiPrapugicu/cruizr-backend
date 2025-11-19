import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('polls')
export class Poll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column('json')
  options: string[];

  @Column({ default: false })
  allowMultipleChoices: boolean;

  @Column({ default: 60 })
  durationMinutes: number;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  createdByUserId: number;

  @ManyToOne(() => User, (user) => user.id)
  createdBy: User;

  @Column()
  matchId: string;

  @OneToMany(() => PollVote, (vote) => vote.poll)
  votes: PollVote[];

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('poll_votes')
export class PollVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pollId: number;

  @Column()
  userId: number;

  @Column()
  optionIndex: number;

  @Column({ length: 500, nullable: true })
  comment: string;

  @ManyToOne(() => Poll, (poll) => poll.votes)
  poll: Poll;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
