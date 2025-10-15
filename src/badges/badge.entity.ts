import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string; // unique identifier like 'first_car', 'drift_king', etc.

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  icon: string; // emoji or icon name

  @Column()
  color: string; // hex color for badge

  @Column({ default: false })
  isRare: boolean; // rare badges are more special

  @Column({ default: 1 })
  requiredCount: number; // how many times action needed

  @Column({ nullable: true })
  category: string; // badge category for filtering

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
