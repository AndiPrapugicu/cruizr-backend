import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateBadgeDto {
  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  icon: string;

  @IsString()
  color: string;

  @IsOptional()
  @IsBoolean()
  isRare?: boolean;

  @IsOptional()
  @IsNumber()
  requiredCount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
