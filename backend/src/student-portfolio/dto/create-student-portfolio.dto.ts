import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateSkillDto,
  CreateProjectDto,
  CreateExperienceDto,
  CreateEducationDto,
  CreatePortfolioAchievementDto,
  CreatePortfolioContactDto,
} from './create-related.dto';
import { IsAppUrl } from '../../common/decorators/is-app-url.decorator';

export class CreateStudentPortfolioDto {
  @ApiProperty({ description: 'Full name', example: 'Võ Hữu Nhân' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({
    description: 'URL-friendly slug, becomes the public URL /:slug',
    example: 'vo-huu-nhan',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsAppUrl()
  avatarUrl?: string;

  @ApiProperty({ required: false, example: 'Sinh viên Khoa học Máy tính' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ required: false, description: 'Hero tagline, 1-2 câu' })
  @IsString()
  @IsOptional()
  shortBio?: string;

  @ApiProperty({ required: false, description: 'Đoạn giới thiệu dài hơn' })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  program?: string;

  @ApiProperty({ required: false, example: 2023 })
  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  studentYear?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @ApiProperty({
    required: false,
    default: false,
    description: 'Only published portfolios are visible on the public site',
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiProperty({ type: () => [CreateSkillDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSkillDto)
  skills?: CreateSkillDto[];

  @ApiProperty({ type: () => [CreateProjectDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectDto)
  projects?: CreateProjectDto[];

  @ApiProperty({ type: () => [CreateExperienceDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateExperienceDto)
  experiences?: CreateExperienceDto[];

  @ApiProperty({ type: () => [CreateEducationDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEducationDto)
  education?: CreateEducationDto[];

  @ApiProperty({ type: () => [CreatePortfolioAchievementDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePortfolioAchievementDto)
  achievements?: CreatePortfolioAchievementDto[];

  @ApiProperty({ type: () => [CreatePortfolioContactDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePortfolioContactDto)
  contacts?: CreatePortfolioContactDto[];
}
