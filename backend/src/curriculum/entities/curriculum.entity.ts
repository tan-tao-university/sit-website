import { ApiProperty } from '@nestjs/swagger';
import { ProgramEntity } from '../../program/entities/program.entity';
import { SectionEntity } from '../../section/entities/section.entity';

export class CurriculumEntity {
  @ApiProperty({
    description: 'Unique identifier for the curriculum',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  curriculumId: string;

  @ApiProperty({
    description: 'Program ID this curriculum belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  programId: string;

  @ApiProperty({
    description: 'Academic year',
    example: 2025,
  })
  year: number;

  @ApiProperty({
    description: 'Curriculum name',
    example: 'CTĐT KHMT 2025',
  })
  name: string;

  @ApiProperty({
    description: 'Curriculum description',
    example: 'Chương trình đào tạo Khoa học máy tính năm 2025',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'URL to banner image',
    example: 'https://example.com/curriculum-banner.jpg',
    required: false,
  })
  banner?: string;

  @ApiProperty({
    description: 'URL to PDF document',
    example: 'https://example.com/curriculum.pdf',
    required: false,
  })
  pdfUrl?: string;

  @ApiProperty({
    description: 'Whether this is the current active curriculum',
    example: true,
  })
  isCurrent: boolean;

  @ApiProperty({
    description: 'Publication date',
    example: '2025-01-01T00:00:00.000Z',
  })
  publishedAt: Date;
}

export class CurriculumWithSectionsEntity extends CurriculumEntity {
  @ApiProperty({ type: SectionEntity, isArray: true })
  sections: SectionEntity[];
}

export class CurriculumDetailsEntity extends CurriculumWithSectionsEntity {
  @ApiProperty({ type: ProgramEntity })
  program: ProgramEntity;
}
