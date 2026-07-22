import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export enum CareerOpportunityType {
  INTERNSHIP = 'internship',
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
}

export enum CareerWorkMode {
  ONSITE = 'onsite',
  HYBRID = 'hybrid',
  REMOTE = 'remote',
}

export enum CareerOpportunityStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}

export class CreateCareerOpportunityDto {
  @ApiProperty({ description: 'Vietnamese opportunity title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleVi: string;

  @ApiPropertyOptional({ description: 'English opportunity title' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  titleEn?: string;

  @ApiProperty({ description: 'Employer or organization name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  companyName: string;

  @ApiPropertyOptional({ description: 'Public employer logo URL' })
  @IsUrl({ require_tld: false })
  @IsOptional()
  companyLogoUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  summaryVi?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  summaryEn?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  requirementsVi?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  requirementsEn?: string;

  @ApiProperty({ enum: CareerOpportunityType })
  @IsEnum(CareerOpportunityType)
  type: CareerOpportunityType;

  @ApiProperty({ enum: CareerWorkMode })
  @IsEnum(CareerWorkMode)
  workMode: CareerWorkMode;

  @ApiProperty({ description: 'Vietnamese work location' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  locationVi: string;

  @ApiPropertyOptional({ description: 'English work location' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  locationEn?: string;

  @ApiPropertyOptional({ description: 'Comma-separated skill names' })
  @IsString()
  @IsOptional()
  skills?: string;

  @ApiPropertyOptional({ description: 'Salary or allowance as display text' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  salaryText?: string;

  @ApiPropertyOptional({ description: 'Application form or external job URL' })
  @IsUrl({ require_tld: false })
  @IsOptional()
  applicationUrl?: string;

  @ApiPropertyOptional({ description: 'Application contact email' })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsISO8601()
  @IsOptional()
  applicationDeadline?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsISO8601()
  @IsOptional()
  publishedAt?: string;

  @ApiPropertyOptional({
    enum: CareerOpportunityStatus,
    default: CareerOpportunityStatus.DRAFT,
  })
  @IsEnum(CareerOpportunityStatus)
  @IsOptional()
  status?: CareerOpportunityStatus;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
