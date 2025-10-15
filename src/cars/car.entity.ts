import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column('simple-array', { nullable: true })
  mods: string[];

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  engine: string;

  @Column({ nullable: true })
  engineSize: string; // ex: "2.0L", "1600cc"

  @Column({ nullable: true })
  bodyType: string; // sedan, coupe, hatchback, wagon, etc.

  @Column({ nullable: true })
  torque: number; // Nm

  @Column({ nullable: true })
  drivetrain: string; // FWD, RWD, AWD

  @Column({ nullable: true })
  mileage: number; // kilometraj

  @Column({ nullable: true })
  upholsteryType: string; // piele, textil, alcantara

  @Column({ nullable: true })
  interiorColor: string;

  @Column({ nullable: true })
  doors: number; // 2, 3, 4, 5

  @Column({ nullable: true })
  seats: number; // numărul de locuri

  @Column({ default: false })
  hasSunroof: boolean;

  @Column({ nullable: true })
  transmission: string;

  @Column({ nullable: true })
  fuelType: string;

  @Column({ nullable: true })
  horsepower: number;

  @Column({ nullable: true })
  notes: string;

  @Column('simple-array', { nullable: true })
  photos: string[];

  @Column({ nullable: true })
  garageTourVideo: string; // URL to garage tour video

  @ManyToOne(() => User, (user) => user.cars, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
