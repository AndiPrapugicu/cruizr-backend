import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  userA: User;

  @ManyToOne(() => User, { eager: true })
  userB: User;

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected';
}
