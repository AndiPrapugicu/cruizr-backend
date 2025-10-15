// src/matches/dto/swipe.dto.ts
import { IsInt, IsIn } from 'class-validator';

export class SwipeDto {
  @IsInt()
  userId: number;

  @IsIn(['right', 'left'])
  direction: 'right' | 'left';
}
