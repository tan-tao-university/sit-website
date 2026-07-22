import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateAcademicProfileDto,
  CreateCareerDto,
  CreateAlumniAchievementDto,
  CreateContactDto,
  CreateSectionMemberDto,
  CreateAlumniMetaDto,
} from './create-related.dto';
import { IsAppUrl } from '../../common/decorators/is-app-url.decorator';

export class CreateAlumniDto {
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
    description: 'Graduation year',
    example: 2023,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  graduationYear?: number;

  @ApiProperty({
    description: 'Program name',
    example: 'Computer Science',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  program?: string;

  @ApiProperty({
    description: 'Degree obtained',
    example: 'Bachelor',
    maxLength: 50,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  degree?: string;

  @ApiProperty({
    description: 'Short bio',
    example: 'Software Engineer at Google',
    required: false,
  })
  @IsString()
  @IsOptional()
  shortBio?: string;

  @ApiProperty({
    description: 'Personal story',
    example: 'My journey...',
    required: false,
  })
  @IsString()
  @IsOptional()
  personalStory?: string;

  @ApiProperty({ type: () => CreateAcademicProfileDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAcademicProfileDto)
  academicProfile?: CreateAcademicProfileDto;

  @ApiProperty({ type: () => [CreateCareerDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCareerDto)
  careers?: CreateCareerDto[];

  @ApiProperty({ type: () => [CreateAlumniAchievementDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAlumniAchievementDto)
  achievements?: CreateAlumniAchievementDto[];

  @ApiProperty({ type: () => [CreateContactDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateContactDto)
  contacts?: CreateContactDto[];

  @ApiProperty({ type: () => [CreateSectionMemberDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionMemberDto)
  sectionMembers?: CreateSectionMemberDto[];

  @ApiProperty({ type: () => CreateAlumniMetaDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAlumniMetaDto)
  meta?: CreateAlumniMetaDto;
}
