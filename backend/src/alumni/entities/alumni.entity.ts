import { ApiProperty } from '@nestjs/swagger';

export class AlumniEntity {
  @ApiProperty({
    description: 'Unique identifier for the alumni',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'nguyen-van-a',
  })
  slug: string;

  @ApiProperty({
    description: 'Full name',
    example: 'Nguyễn Văn A',
  })
  fullName: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Graduation year',
    example: 2023,
    required: false,
  })
  graduationYear?: number;

  @ApiProperty({
    description: 'Program name',
    example: 'Computer Science',
    required: false,
  })
  program?: string;

  @ApiProperty({
    description: 'Degree obtained',
    example: 'Bachelor',
    required: false,
  })
  degree?: string;

  @ApiProperty({
    description: 'Short bio (1-2 sentences)',
    example: 'Software Engineer at Google. Passionate about AI.',
    required: false,
  })
  shortBio?: string;

  @ApiProperty({
    description: 'Personal story (150-300 words)',
    example: 'My journey started when...',
    required: false,
  })
  personalStory?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-20T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-20T10:00:00Z',
  })
  updatedAt: Date;
}
