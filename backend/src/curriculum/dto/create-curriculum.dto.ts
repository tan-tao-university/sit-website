import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCurriculumDto {
  @ApiProperty({
    description: 'Program ID this curriculum belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  programId: string;

  @ApiProperty({
    description: 'Academic year',
    example: 2025,
    minimum: 2000,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(2000)
  year: number;

  @ApiProperty({
    description: 'Curriculum name in Vietnamese',
    example: 'CTĐT KHMT 2025',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameVi: string;

  @ApiProperty({
    description: 'Curriculum name in English',
    example: 'CS Curriculum 2025',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  nameEn?: string;

  @ApiProperty({
    description: 'URL-friendly slug for Vietnamese name',
    example: 'khung-chuong-trinh-2024',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  slugVi: string;

  @ApiProperty({
    description: 'URL-friendly slug for English name',
    example: 'curriculum-2024',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  slugEn: string;

  @ApiProperty({
    description: 'Curriculum description in Vietnamese',
    example: 'Chương trình đào tạo Khoa học máy tính năm 2025',
    required: false,
  })
  @IsString()
  @IsOptional()
  descriptionVi?: string;

  @ApiProperty({
    description: 'Curriculum description in English',
    example: 'Computer Science Curriculum 2025',
    required: false,
  })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty({
    description: 'URL to banner image',
    example: 'https://example.com/curriculum-banner.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  banner?: string;

  @ApiProperty({
    description: 'URL to PDF document',
    example: 'https://example.com/curriculum.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @ApiProperty({
    description: 'Whether this is the current active curriculum',
    example: true,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @ApiProperty({
    description: 'Duration in years',
    example: 4.5,
    minimum: 1,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @IsOptional()
  @Min(1)
  durationYears?: number;

  @ApiProperty({
    description: 'Total number of semesters',
    example: 8,
    minimum: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  totalSemesters?: number;

  @ApiProperty({
    description: 'Total credits required',
    example: 130,
    minimum: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  totalCredits?: number;

  @ApiProperty({
    description: 'Type of education',
    example: 'chính quy',
    maxLength: 50,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  educationType?: string;

  @ApiProperty({
    description: 'Language of instruction',
    example: 'Tiếng Việt',
    maxLength: 10,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  language?: string;

  @ApiProperty({
    description: 'Degree awarded upon completion',
    example: 'Cử nhân Khoa học máy tính',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  degreeAwarded?: string;
}
