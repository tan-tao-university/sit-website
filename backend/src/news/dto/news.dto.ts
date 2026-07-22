import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsISO8601,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty()
  @IsObject()
  content: any; // Yoopta JSON

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({
    enum: [
      'workshop',
      'achievements',
      'academic',
      'business',
      'events',
      'general',
    ],
    default: 'general',
    required: false,
  })
  @IsEnum([
    'workshop',
    'achievements',
    'academic',
    'business',
    'events',
    'general',
  ])
  @IsOptional()
  category?:
    | 'workshop'
    | 'achievements'
    | 'academic'
    | 'business'
    | 'events'
    | 'general';

  @ApiProperty({ enum: ['draft', 'published', 'archived'], default: 'draft' })
  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: 'draft' | 'published' | 'archived';

  @ApiProperty({ required: false, format: 'date-time' })
  @IsISO8601()
  @IsOptional()
  publishedAt?: string;
}

export class UpdateNewsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  content?: any;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({
    enum: [
      'workshop',
      'achievements',
      'academic',
      'business',
      'events',
      'general',
    ],
    required: false,
  })
  @IsEnum([
    'workshop',
    'achievements',
    'academic',
    'business',
    'events',
    'general',
  ])
  @IsOptional()
  category?:
    | 'workshop'
    | 'achievements'
    | 'academic'
    | 'business'
    | 'events'
    | 'general';

  @ApiProperty({ enum: ['draft', 'published', 'archived'], required: false })
  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: 'draft' | 'published' | 'archived';

  @ApiProperty({ required: false, format: 'date-time' })
  @IsISO8601()
  @IsOptional()
  publishedAt?: string;
}
