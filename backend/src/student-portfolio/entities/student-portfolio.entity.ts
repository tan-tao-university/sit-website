import { ApiProperty } from '@nestjs/swagger';

export class StudentPortfolioEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'vo-huu-nhan' })
  slug: string;

  @ApiProperty({ example: 'Võ Hữu Nhân' })
  fullName: string;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty({ required: false, example: 'Sinh viên Khoa học Máy tính' })
  title?: string;

  @ApiProperty({ required: false })
  shortBio?: string;

  @ApiProperty({ required: false })
  about?: string;

  @ApiProperty({ required: false })
  program?: string;

  @ApiProperty({ required: false })
  studentYear?: number;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ default: false })
  isPublished: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
