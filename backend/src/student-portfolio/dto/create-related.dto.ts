import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { IsAppUrl } from '../../common/decorators/is-app-url.decorator';

export class CreateSkillDto {
  @ApiProperty({ required: false, example: 'Programming Languages' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ example: 'TypeScript' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Portfolio Website' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsAppUrl()
  imageUrl?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  techStack?: string[];

  @ApiProperty({ required: false, example: 'Frontend Developer' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  role?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsAppUrl()
  demoUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsAppUrl()
  repoUrl?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class CreateExperienceDto {
  @ApiProperty({ example: 'FPT Software' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  organization: string;

  @ApiProperty({ example: 'Software Engineering Intern' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  role: string;

  @ApiProperty({ required: false, example: '2024-06' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-09' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  endDate?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class CreateEducationDto {
  @ApiProperty({ example: 'Đại học Tân Tạo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  school: string;

  @ApiProperty({ required: false, example: 'Bachelor' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  degree?: string;

  @ApiProperty({ required: false, example: 'Computer Science' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  field?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  startYear?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  endYear?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class CreatePortfolioAchievementDto {
  @ApiProperty({ example: 'Học bổng Tân Tạo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  year?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsAppUrl()
  link?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class CreatePortfolioContactDto {
  @ApiProperty({ example: 'github' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @ApiProperty({ example: 'https://github.com/username' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}
