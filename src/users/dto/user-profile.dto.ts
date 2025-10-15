// src/users/dto/user-profile.dto.ts
import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class UserProfileDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  carModel?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  carMods?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  birthdate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interests?: string[];

  @IsNumber()
  @IsOptional()
  age?: number;
}
