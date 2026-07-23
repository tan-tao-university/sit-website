import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateAcademicProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  major?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thesisTitle?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  advisor?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  researchArea?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  honors?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateCareerDto {
  @ApiProperty()
  @IsString()
  organization: string;

  @ApiProperty()
  @IsString()
  role: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  startYear?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  endYear?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateSectionMemberDto {
  @ApiProperty()
  @IsString()
  sectionId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customTitle?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customQuote?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class CreateAlumniMetaDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  visibility?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  verifiedBy?: string;
}

export class CreateAlumniAchievementDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  year?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  link?: string;
}

export class CreateContactDto {
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  visibility?: string;
}
