import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HandbookEntity {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: '2023-2024' })
  schoolYear: string;

  @ApiProperty({ enum: ['draft', 'published'] })
  status: string;

  @ApiPropertyOptional({ description: 'Yoopta value (Vietnamese)' })
  contentVi?: any;

  @ApiPropertyOptional({ description: 'Yoopta value (English)' })
  contentEn?: any;

  @ApiPropertyOptional()
  pdfUrlVi?: string;

  @ApiPropertyOptional()
  pdfUrlEn?: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}
