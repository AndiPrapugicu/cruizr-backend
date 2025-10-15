import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class UpdateCarDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mods?: string[];

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  engine?: string;

  @IsOptional()
  @IsString()
  engineSize?: string;

  @IsOptional()
  @IsString()
  bodyType?: string;

  @IsOptional()
  @IsNumber()
  torque?: number;

  @IsOptional()
  @IsString()
  drivetrain?: string;

  @IsOptional()
  @IsNumber()
  mileage?: number;

  @IsOptional()
  @IsString()
  upholsteryType?: string;

  @IsOptional()
  @IsString()
  interiorColor?: string;

  @IsOptional()
  @IsNumber()
  doors?: number;

  @IsOptional()
  @IsNumber()
  seats?: number;

  @IsOptional()
  @IsBoolean()
  hasSunroof?: boolean;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @IsNumber()
  horsepower?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
