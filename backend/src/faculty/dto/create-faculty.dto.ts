import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateAcademicTimelineDto,
  CreateResearchAreaDto,
  CreatePublicationDto,
  CreateFacultyCourseDto,
  CreateFacultyContactDto,
  CreateFacultyMetaDto,
} from './create-related.dto';
import { IsAppUrl } from '../../common/decorators/is-app-url.decorator';

export class CreateFacultyDto {
  @ApiProperty({
    description: 'Full name',
    example: 'Nguyễn Văn A',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'nguyen-van-a',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsAppUrl()
  avatarUrl?: string;

  @ApiProperty({
    description: 'Academic title (TS., PGS.TS., ThS.)',
    example: 'PGS.TS.',
    maxLength: 50,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  academicTitle?: string;

  @ApiProperty({
    description: 'Position (Dean, Associate Professor, Lecturer)',
    example: 'Associate Professor',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  position?: string;

  @ApiProperty({
    description: 'Department',
    example: 'School of Information Technology',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  department?: string;

  @ApiProperty({
    description: 'Philosophy quote',
    required: false,
  })
  @IsString()
  @IsOptional()
  quote?: string;

  @ApiProperty({
    description: 'Short bio (2-3 sentences)',
    required: false,
  })
  @IsString()
  @IsOptional()
  bioShort?: string;

  @ApiProperty({
    description: 'Is faculty active',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ type: () => [CreateAcademicTimelineDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAcademicTimelineDto)
  academicTimeline?: CreateAcademicTimelineDto[];

  @ApiProperty({ type: () => [CreateResearchAreaDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResearchAreaDto)
  researchAreas?: CreateResearchAreaDto[];

  @ApiProperty({ type: () => [CreatePublicationDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePublicationDto)
  publications?: CreatePublicationDto[];

  @ApiProperty({ type: () => [CreateFacultyCourseDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFacultyCourseDto)
  courses?: CreateFacultyCourseDto[];

  @ApiProperty({ type: () => [CreateFacultyContactDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFacultyContactDto)
  contacts?: CreateFacultyContactDto[];

  @ApiProperty({ type: () => CreateFacultyMetaDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateFacultyMetaDto)
  meta?: CreateFacultyMetaDto;
}
