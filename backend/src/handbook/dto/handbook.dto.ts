import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

const SCHOOL_YEAR_REGEX = /^\d{4}-\d{4}$/;

export class CreateHandbookDto {
  @ApiProperty({
    example: '2023-2024',
    description: 'School year, format YYYY-YYYY',
  })
  @IsString()
  @Matches(SCHOOL_YEAR_REGEX, {
    message: 'schoolYear must be in the format YYYY-YYYY',
  })
  schoolYear: string;

  @ApiPropertyOptional({ enum: ['draft', 'published'], default: 'draft' })
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @ApiPropertyOptional({ description: 'Yoopta editor value (Vietnamese)' })
  @IsOptional()
  contentVi?: any;

  @ApiPropertyOptional({ description: 'Yoopta editor value (English)' })
  @IsOptional()
  contentEn?: any;

  @ApiPropertyOptional({ description: 'R2 URL of the original Vietnamese PDF' })
  @IsOptional()
  @IsString()
  pdfUrlVi?: string;

  @ApiPropertyOptional({ description: 'R2 URL of the original English PDF' })
  @IsOptional()
  @IsString()
  pdfUrlEn?: string;
}

export class UpdateHandbookDto {
  @ApiPropertyOptional({ example: '2023-2024' })
  @IsOptional()
  @IsString()
  @Matches(SCHOOL_YEAR_REGEX, {
    message: 'schoolYear must be in the format YYYY-YYYY',
  })
  schoolYear?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published'] })
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @ApiPropertyOptional()
  @IsOptional()
  contentVi?: any;

  @ApiPropertyOptional()
  @IsOptional()
  contentEn?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfUrlVi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfUrlEn?: string;
}
