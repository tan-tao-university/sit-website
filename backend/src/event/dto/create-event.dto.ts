import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
}

export class CreateEventDto {
  @ApiProperty({ description: 'Vietnamese event title', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleVi: string;

  @ApiPropertyOptional({ description: 'English event title', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  titleEn?: string;

  @ApiPropertyOptional({ description: 'Vietnamese event description' })
  @IsString()
  @IsOptional()
  descriptionVi?: string;

  @ApiPropertyOptional({ description: 'English event description' })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty({ format: 'date-time' })
  @IsISO8601()
  startAt: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsISO8601()
  @IsOptional()
  endAt?: string;

  @ApiProperty({ description: 'Vietnamese event location', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  locationVi: string;

  @ApiPropertyOptional({
    description: 'English event location',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  locationEn?: string;

  @ApiPropertyOptional({ description: 'Registration or external details URL' })
  @IsUrl({ require_tld: false })
  @IsOptional()
  registrationUrl?: string;

  @ApiPropertyOptional({ enum: EventStatus, default: EventStatus.DRAFT })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
