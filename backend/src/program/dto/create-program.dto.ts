import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  MaxLength,
  IsObject,
} from 'class-validator';

export class CreateProgramDto {
  @ApiProperty({
    description: 'Program code (e.g., KHMT, CS)',
    example: 'KHMT',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'Program name in Vietnamese',
    example: 'Khoa học máy tính',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameVi: string;

  @ApiProperty({
    description: 'Program name in English',
    example: 'Computer Science',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  nameEn?: string;

  @ApiProperty({
    description: 'URL-friendly slug for Vietnamese name',
    example: 'khoa-hoc-may-tinh',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  slugVi: string;

  @ApiProperty({
    description: 'URL-friendly slug for English name',
    example: 'computer-science',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  slugEn: string;

  @ApiProperty({
    description: 'Education level',
    example: 'undergraduate',
    enum: ['undergraduate', 'postgraduate'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['undergraduate', 'postgraduate'])
  level: string;

  @ApiProperty({
    description: 'Major code according to Ministry of Education',
    example: '7480101',
    maxLength: 20,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  majorCode?: string;

  @ApiProperty({
    description: 'Program description in Vietnamese',
    example: 'Mô tả chương trình...',
    required: false,
  })
  @IsString()
  @IsOptional()
  descriptionVi?: string;

  @ApiProperty({
    description: 'Program description in English',
    example: 'Program description...',
    required: false,
  })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty({
    description: 'Yoopta Editor content (JSON structure)',
    example: { bs: [] },
    required: true,
  })
  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;

  @ApiProperty({
    description: 'URL to banner image',
    example: 'https://example.com/banner.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  banner?: string;

  @ApiProperty({
    description: 'Program status',
    example: 'active',
    enum: ['active', 'inactive'],
    default: 'active',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}
