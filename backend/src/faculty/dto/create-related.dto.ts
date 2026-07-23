import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { IsAppUrl } from '../../common/decorators/is-app-url.decorator';

export class CreateAcademicTimelineDto {
  @ApiProperty({ required: false, description: 'Degree (PhD, MSc, BSc)' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  degree?: string;

  @ApiProperty({ required: false, description: 'Field of study' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  field?: string;

  @ApiProperty({ required: false, description: 'Institution name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  institution?: string;

  @ApiProperty({ required: false, description: 'Country' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ required: false, description: 'Start year' })
  @IsInt()
  @IsOptional()
  startYear?: number;

  @ApiProperty({ required: false, description: 'End year' })
  @IsInt()
  @IsOptional()
  endYear?: number;

  @ApiProperty({ required: false, description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, description: 'Display order' })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class CreateResearchAreaDto {
  @ApiProperty({ required: false, description: 'Research area title' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ required: false, description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, description: 'Display order' })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class CreatePublicationDto {
  @ApiProperty({ required: false, description: 'Publication title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    required: false,
    description: 'Venue (IEEE, Nature, ICML...)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  venue?: string;

  @ApiProperty({ required: false, description: 'Publication year' })
  @IsInt()
  @IsOptional()
  year?: number;

  @ApiProperty({
    required: false,
    description: 'Publication type (journal | conference)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  publicationType?: string;

  @ApiProperty({ required: false, description: 'DOI' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  doi?: string;

  @ApiProperty({ required: false, description: 'Publisher URL' })
  @IsString()
  @IsOptional()
  @IsAppUrl()
  publisherUrl?: string;

  @ApiProperty({ required: false, description: 'Display order' })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class CreateFacultyCourseDto {
  @ApiProperty({ description: 'Course ID to link' })
  @IsString()
  @IsUUID()
  courseId: string;
}

export class CreateFacultyContactDto {
  @ApiProperty({
    description: 'Contact type (email | phone | scholar | linkedin)',
  })
  @IsString()
  @MaxLength(50)
  type: string;

  @ApiProperty({ required: false, description: 'Contact value' })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiProperty({
    required: false,
    description: 'Visibility (public | internal)',
    default: 'public',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  visibility?: string;
}

export class CreateFacultyMetaDto {
  @ApiProperty({
    required: false,
    description: 'Profile visibility (public | internal)',
    default: 'public',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  profileVisibility?: string;

  @ApiProperty({ required: false, description: 'Updated by user' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  updatedBy?: string;
}
