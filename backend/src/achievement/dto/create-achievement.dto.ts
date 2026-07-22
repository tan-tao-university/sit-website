import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AchievementType {
  HACKATHON = 'HACKATHON',
  AWARD = 'AWARD',
  SCHOLARSHIP = 'SCHOLARSHIP',
  RESEARCH = 'RESEARCH',
  COMPETITION = 'COMPETITION',
  OTHER = 'OTHER',
}

export enum AchievementLevel {
  UNIVERSITY = 'UNIVERSITY',
  NATIONAL = 'NATIONAL',
  INTERNATIONAL = 'INTERNATIONAL',
}

export enum AchievementVisibility {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
}

export class CreateAchievementDto {
  @ApiProperty({ description: 'Achievement title', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({ enum: AchievementType, description: 'Type of achievement' })
  @IsEnum(AchievementType)
  @IsNotEmpty()
  type: AchievementType;

  @ApiPropertyOptional({ description: 'Achievement description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Student names (semicolon-separated)',
    example: 'Nguyễn Hoài Duy; Huỳnh Văn Đông',
  })
  @IsString()
  @IsOptional()
  studentNames?: string;

  @ApiPropertyOptional({ description: 'Project name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  projectName?: string;

  @ApiPropertyOptional({ description: 'Organization name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  organization?: string;

  @ApiPropertyOptional({
    enum: AchievementLevel,
    description: 'Achievement level',
  })
  @IsEnum(AchievementLevel)
  @IsOptional()
  level?: AchievementLevel;

  @ApiPropertyOptional({ description: 'Rank/Position achieved' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  rank?: string;

  @ApiPropertyOptional({ description: 'Reward received' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  reward?: string;

  @ApiPropertyOptional({ description: 'Year achieved' })
  @IsInt()
  @IsOptional()
  achievedYear?: number;

  @ApiPropertyOptional({ description: 'Highlight on website' })
  @IsBoolean()
  @IsOptional()
  isHighlight?: boolean;

  @ApiPropertyOptional({
    enum: AchievementVisibility,
    description: 'Visibility',
  })
  @IsEnum(AchievementVisibility)
  @IsOptional()
  visibility?: AchievementVisibility;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  @IsString()
  @IsOptional()
  coverImage?: string;
}
