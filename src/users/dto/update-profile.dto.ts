import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  carModel?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  carMods?: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos: string[];

  // ► oraș
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  birthdate?: string; // așteptăm "yyyy-MM-dd"

  // ► interese (array de string)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  prefGender?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  highlightColor?: string;
}
