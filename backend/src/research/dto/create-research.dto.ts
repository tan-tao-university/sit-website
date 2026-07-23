import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsAppUrl } from '../../common/decorators/is-app-url.decorator';

export enum ResearchType {
  PROJECT = 'PROJECT',
  PUBLICATION = 'PUBLICATION',
}

export enum ResearchStatus {
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

export enum ResearchLanguage {
  VI = 'vi',
  EN = 'en',
}

export class CreateResearchDto {
  @ApiProperty({ enum: ResearchType, description: 'Type of research' })
  @IsEnum(ResearchType)
  @IsNotEmpty()
  type: ResearchType;

  @ApiProperty({ description: 'Research title', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug', maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  slug?: string;

  @ApiPropertyOptional({ description: 'Research abstract' })
  @IsString()
  @IsOptional()
  abstract?: string;

  @ApiPropertyOptional({ description: 'Authors (comma-separated or JSON)' })
  @IsString()
  @IsOptional()
  authors?: string;

  @ApiPropertyOptional({ description: 'Principal investigator name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  principalInvestigator?: string;

  @ApiPropertyOptional({ description: 'Unit/Faculty (e.g., SIT, TTU)' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  unit?: string;

  @ApiPropertyOptional({ description: 'Research field/area' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  researchField?: string;

  // Project-specific fields
  @ApiPropertyOptional({ description: 'Sponsor/funding organization' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  sponsor?: string;

  @ApiPropertyOptional({ description: 'Funding amount' })
  @IsString()
  @IsOptional()
  fundingAmount?: string;

  @ApiPropertyOptional({ description: 'Project start year' })
  @IsInt()
  @IsOptional()
  startYear?: number;

  @ApiPropertyOptional({ description: 'Project end year' })
  @IsInt()
  @IsOptional()
  endYear?: number;

  @ApiPropertyOptional({ enum: ResearchStatus, description: 'Project status' })
  @IsEnum(ResearchStatus)
  @IsOptional()
  status?: ResearchStatus;

  // Publication-specific fields
  @ApiPropertyOptional({ description: 'Journal name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  journalName?: string;

  @ApiPropertyOptional({ description: 'Publisher name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  publisher?: string;

  @ApiPropertyOptional({ description: 'Publication year' })
  @IsInt()
  @IsOptional()
  publicationYear?: number;

  @ApiPropertyOptional({ description: 'DOI identifier' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  doi?: string;

  @ApiPropertyOptional({ description: 'PDF URL' })
  // Empty string means "clear the field" from the edit form — normalize it to
  // null so @IsOptional() skips @IsAppUrl() instead of rejecting "" as an invalid URL.
  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @IsAppUrl()
  @IsOptional()
  pdfUrl?: string;

  // Metadata
  @ApiPropertyOptional({ description: 'Keywords (comma-separated)' })
  @IsString()
  @IsOptional()
  keywords?: string;

  @ApiPropertyOptional({ enum: ResearchLanguage, description: 'Language' })
  @IsEnum(ResearchLanguage)
  @IsOptional()
  language?: ResearchLanguage;
}
