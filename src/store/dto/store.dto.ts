import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class PurchaseItemDto {
  @IsString()
  itemId: string;
}

export class ActivateItemDto {
  @IsString()
  itemId: string;
}

export class DeactivateItemDto {
  @IsString()
  itemId: string;
}

export class CreateStoreItemDto {
  @IsString()
  itemId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  icon: string;

  @IsNumber()
  price: number;

  @IsEnum(['fuel', 'premium'])
  currency: 'fuel' | 'premium';

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPermanent?: boolean;

  @IsOptional()
  @IsBoolean()
  isLimited?: boolean;

  @IsOptional()
  @IsNumber()
  limitedQuantity?: number;

  @IsOptional()
  @IsObject()
  requirements?: {
    minLevel?: number;
    badges?: string[];
    achievements?: string[];
  };

  @IsOptional()
  @IsObject()
  effects?: {
    boostMultiplier?: number;
    duration?: number;
    type?: 'visibility' | 'matching' | 'profile' | 'social' | 'access';
  };

  @IsOptional()
  @IsObject()
  metadata?: {
    color?: string;
    animation?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  };
}

export class UpdateStoreItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsEnum(['fuel', 'premium'])
  currency?: 'fuel' | 'premium';

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPermanent?: boolean;

  @IsOptional()
  @IsBoolean()
  isLimited?: boolean;

  @IsOptional()
  @IsNumber()
  limitedQuantity?: number;

  @IsOptional()
  @IsObject()
  requirements?: {
    minLevel?: number;
    badges?: string[];
    achievements?: string[];
  };

  @IsOptional()
  @IsObject()
  effects?: {
    boostMultiplier?: number;
    duration?: number;
    type?: 'visibility' | 'matching' | 'profile' | 'social' | 'access';
  };

  @IsOptional()
  @IsObject()
  metadata?: {
    color?: string;
    animation?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  };
}
