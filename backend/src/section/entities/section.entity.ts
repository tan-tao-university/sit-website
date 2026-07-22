import { ApiProperty } from '@nestjs/swagger';

export class SectionEntity {
  @ApiProperty({
    description: 'Unique identifier for the section',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  sectionId: string;

  @ApiProperty({
    description: 'Curriculum ID this section belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  curriculumId: string;

  @ApiProperty({
    description: 'Section key identifier',
    example: 'intro',
    enum: [
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
    ],
  })
  sectionKey: string;

  @ApiProperty({
    description: 'Section title',
    example: 'Giới thiệu CTĐT',
  })
  title: string;

  @ApiProperty({
    description: 'Section content (HTML or Markdown)',
    example: '<p>Nội dung giới thiệu chương trình đào tạo...</p>',
    required: false,
  })
  content?: string;

  @ApiProperty({
    description: 'Display order',
    example: 1,
    required: false,
  })
  displayOrder?: number;

  @ApiProperty({
    description: 'Whether the section is visible',
    example: true,
  })
  isVisible: boolean;
}
