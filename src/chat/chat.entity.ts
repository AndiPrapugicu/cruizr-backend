import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  matchId: string;

  @Column()
  from: string;

  @Column()
  text: string;

  @Column({ default: 'text' })
  type: string; // 'text', 'poll', 'poll_vote'

  @Column({ type: 'json', nullable: true })
  metadata: any; // pentru poll data, votes etc.

  @CreateDateColumn()
  createdAt: Date;
}
