import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course code (e.g., CS101)',
    example: 'CS101',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Course name in Vietnamese',
    example: 'Nhập môn Lập trình',
  })
  @IsString()
  @IsNotEmpty()
  nameVi: string;

  @ApiProperty({
    description: 'Course name in English',
    example: 'Introduction to Programming',
    required: false,
  })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiProperty({
    description: 'URL-friendly slug for Vietnamese name',
    example: 'nhap-mon-lap-trinh',
  })
  @IsString()
  @IsOptional() // We make it optional in DTO to avoid validation errors if frontend doesn't send it, but schema requires unique. Wait, schema has unique. Frontend should send it. But hidden in UI.
  // Actually, better to be IsOptional if we allow backend to generate it later?
  // But frontend generates it. So it should be there.
  // The error "property slugVi should not exist" comes from "whitelist: true, forbidNonWhitelisted: true" in main.ts.
  // So adding it here solves the error.
  slugVi: string;

  @ApiProperty({
    description: 'URL-friendly slug for English name',
    example: 'introduction-to-programming',
  })
  @IsString()
  @IsOptional()
  slugEn: string;

  @ApiProperty({
    description: 'Number of credits',
    example: 3,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  credits: number;

  @ApiProperty({
    description: 'Lecture hours (LT)',
    example: 45,
    required: false,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  lectureHours?: number;

  @ApiProperty({
    description: 'Practice hours (TH)',
    example: 30,
    required: false,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  practiceHours?: number;
}
