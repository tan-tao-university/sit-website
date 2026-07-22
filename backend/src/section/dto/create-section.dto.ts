import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsUUID,
  MaxLength,
  IsIn,
} from 'class-validator';

const SECTION_KEYS = [
  'intro',
  'overview',
  'vision',
  'objectives',
  'learning_outcomes',
  'admission_requirements',
  'workload',
  'curriculum_structure',
  'teaching_method',
  'assessment',
  'career_opportunities',
  'graduation_requirements',
] as const;

export class CreateSectionDto {
  @ApiProperty({
    description: 'Curriculum ID this section belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  curriculumId: string;

  @ApiProperty({
    description: 'Section key identifier',
    example: 'intro',
    enum: SECTION_KEYS,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(SECTION_KEYS)
  @MaxLength(100)
  sectionKey: string;

  @ApiProperty({
    description: 'Section title',
    example: 'Giới thiệu CTĐT',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Section content (HTML or Markdown)',
    example: '<p>Nội dung giới thiệu chương trình đào tạo...</p>',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Display order',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({
    description: 'Whether the section is visible',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
