import { ApiProperty } from '@nestjs/swagger';

export class CourseEntity {
  @ApiProperty({
    description: 'Unique identifier for the course',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  courseId: string;

  @ApiProperty({
    description: 'Course code (e.g., CS101)',
    example: 'CS101',
  })
  code: string;

  @ApiProperty({
    description: 'Course name in Vietnamese',
    example: 'Nhập môn Lập trình',
  })
  nameVi: string;

  @ApiProperty({
    description: 'Course name in English',
    example: 'Introduction to Programming',
    required: false,
  })
  nameEn?: string;

  @ApiProperty({
    description: 'Number of credits',
    example: 3,
  })
  credits: number;

  @ApiProperty({
    description: 'Lecture hours (LT)',
    example: 45,
    required: false,
  })
  lectureHours?: number;

  @ApiProperty({
    description: 'Practice hours (TH)',
    example: 30,
    required: false,
  })
  practiceHours?: number;
}
