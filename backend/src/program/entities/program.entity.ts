import { ApiProperty } from '@nestjs/swagger';

export class ProgramEntity {
  @ApiProperty({
    description: 'Unique identifier for the program',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  programId: string;

  @ApiProperty({
    description: 'Program code (e.g., KHMT, CS)',
    example: 'KHMT',
  })
  code: string;

  @ApiProperty({
    description: 'Program name in Vietnamese',
    example: 'Khoa học máy tính',
  })
  nameVi: string;

  @ApiProperty({
    description: 'Program name in English',
    example: 'Computer Science',
    required: false,
  })
  nameEn?: string;

  @ApiProperty({
    description: 'Education level',
    example: 'undergraduate',
    enum: ['undergraduate', 'postgraduate'],
  })
  level: string;

  @ApiProperty({
    description: 'Major code according to Ministry of Education',
    example: '7480101',
    required: false,
  })
  majorCode?: string;

  @ApiProperty({
    description: 'Duration in years',
    example: 4,
    required: false,
  })
  durationYears?: number;

  @ApiProperty({
    description: 'Total number of semesters',
    example: 8,
    required: false,
  })
  totalSemesters?: number;

  @ApiProperty({
    description: 'Total credits required',
    example: 130,
    required: false,
  })
  totalCredits?: number;

  @ApiProperty({
    description: 'Type of education',
    example: 'chinh_quy',
    required: false,
  })
  educationType?: string;

  @ApiProperty({
    description: 'Language of instruction',
    example: 'vi',
    required: false,
  })
  language?: string;

  @ApiProperty({
    description: 'Degree awarded upon completion',
    example: 'Cử nhân Khoa học máy tính',
    required: false,
  })
  degreeAwarded?: string;

  @ApiProperty({
    description: 'URL to banner image',
    example: 'https://example.com/banner.jpg',
    required: false,
  })
  banner?: string;

  @ApiProperty({
    description: 'Program status',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status: string;
}
